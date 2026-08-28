import csv
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from campaigns.models import Campaign, FundUtilization
from donations.models import Donation


User = get_user_model()


def _date(value, include_time=False):
    if not value:
        return "-"
    if hasattr(value, "hour"):
        value = timezone.localtime(value)
    return value.strftime("%Y-%m-%d %H:%M" if include_time else "%Y-%m-%d")


def _money(value):
    return f"{float(value or 0):,.2f} MMK"


def _name(user):
    return user.get_full_name() or user.username


def _transaction_rows(params):
    queryset = Donation.objects.select_related(
        "donor", "campaign", "campaign__owner", "demo_payment"
    )
    query = params.get("q", "").strip()
    if query:
        queryset = queryset.filter(
            Q(donor__email__icontains=query)
            | Q(donor__username__icontains=query)
            | Q(donor__first_name__icontains=query)
            | Q(donor__last_name__icontains=query)
            | Q(campaign__title__icontains=query)
            | Q(demo_payment__transaction_reference__icontains=query)
        )

    rows = []
    for donation in queryset:
        payment = getattr(donation, "demo_payment", None)
        rows.append([
            payment.transaction_reference if payment else "Manual record",
            "Anonymous" if donation.is_anonymous else _name(donation.donor),
            donation.donor.email,
            donation.campaign.title,
            _money(donation.amount),
            payment.get_provider_display() if payment else "Manual record",
            payment.get_status_display() if payment else "Recorded",
            _date(donation.created_at, include_time=True),
        ])
    return {
        "title": "Donation transactions",
        "headers": ["Reference", "Donor", "Email", "Campaign", "Amount", "Method", "Status", "Date"],
        "rows": rows,
        "widths": [1.15, 1.0, 1.45, 1.55, 0.85, 1.0, 1.05, 1.1],
    }


def _campaign_rows(params):
    queryset = Campaign.objects.select_related("owner")
    status_filter = params.get("status", "").strip()
    category_filter = params.get("category", "").strip()
    if status_filter in Campaign.Status.values:
        queryset = queryset.filter(status=status_filter)
    if category_filter in Campaign.Category.values:
        queryset = queryset.filter(category=category_filter)

    return {
        "title": "Campaigns",
        "headers": ["Campaign", "Organizer", "Email", "Category", "Location", "Goal", "Raised", "Status", "Deadline"],
        "rows": [[
            campaign.title,
            _name(campaign.owner),
            campaign.owner.email,
            campaign.get_category_display(),
            campaign.location,
            _money(campaign.goal_amount),
            _money(campaign.amount_raised),
            campaign.get_status_display(),
            _date(campaign.deadline),
        ] for campaign in queryset],
        "widths": [1.55, 1.05, 1.35, 0.9, 1.0, 0.9, 0.9, 0.9, 0.85],
    }


def _user_rows(params):
    queryset = User.objects.prefetch_related("campaigns", "donations")
    query = params.get("q", "").strip()
    role = params.get("role", "").strip()
    account_status = params.get("status", "").strip()
    if query:
        queryset = queryset.filter(
            Q(email__icontains=query)
            | Q(username__icontains=query)
            | Q(first_name__icontains=query)
            | Q(last_name__icontains=query)
        )
    if role in User.Role.values:
        queryset = queryset.filter(role=role)
    if account_status == "active":
        queryset = queryset.filter(is_active=True)
    elif account_status == "suspended":
        queryset = queryset.filter(is_active=False)

    rows = []
    for user in queryset.order_by("-created_at"):
        donations = list(user.donations.all())
        rows.append([
            _name(user),
            user.email,
            user.username,
            user.get_role_display(),
            "Active" if user.is_active else "Suspended",
            len(user.campaigns.all()),
            len(donations),
            _money(sum((donation.amount for donation in donations), 0)),
            _date(user.created_at),
        ])
    return {
        "title": "Registered users",
        "headers": ["Name", "Email", "Username", "Role", "Status", "Campaigns", "Donations", "Total donated", "Joined"],
        "rows": rows,
        "widths": [1.1, 1.45, 1.0, 0.7, 0.8, 0.7, 0.7, 1.0, 0.8],
    }


def _utilization_rows(params):
    queryset = FundUtilization.objects.select_related("campaign", "submitted_by")
    status_filter = params.get("status", "").strip()
    campaign_id = params.get("campaign", "").strip()
    if status_filter in FundUtilization.Status.values:
        queryset = queryset.filter(status=status_filter)
    if campaign_id:
        queryset = queryset.filter(campaign_id=campaign_id)

    return {
        "title": "Fund utilization reports",
        "headers": ["Campaign", "Report", "Submitted by", "Amount spent", "Spent on", "Status", "Description", "Attachment"],
        "rows": [[
            item.campaign.title,
            item.title,
            _name(item.submitted_by),
            _money(item.amount_spent),
            _date(item.spent_on),
            item.get_status_display(),
            item.description,
            Path(item.evidence.name).name if item.evidence else "None",
        ] for item in queryset],
        "widths": [1.25, 1.15, 1.0, 0.9, 0.8, 0.85, 2.0, 0.95],
    }


DATASETS = {
    "transactions": _transaction_rows,
    "campaigns": _campaign_rows,
    "users": _user_rows,
    "utilization": _utilization_rows,
}


def build_dataset(resource, params):
    builder = DATASETS.get(resource)
    return builder(params) if builder else None


def csv_response(dataset, filename):
    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = f'attachment; filename="{filename}.csv"'
    response.write("\ufeff")
    writer = csv.writer(response)
    def safe(value):
        return f"'{value}" if str(value).lstrip().startswith(("=", "+", "-", "@")) else value

    writer.writerow(dataset["headers"])
    writer.writerows([[safe(value) for value in row] for row in dataset["rows"]])
    return response


def _register_pdf_font():
    candidates = [
        Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
        Path("/usr/share/fonts/truetype/noto/NotoSansMyanmar-Regular.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ]
    for path in candidates:
        if path.exists():
            pdfmetrics.registerFont(TTFont("GiveraExport", str(path)))
            return "GiveraExport"
    return "Helvetica"


def pdf_response(dataset, filename):
    font_name = _register_pdf_font()
    buffer = BytesIO()
    page_width, _ = landscape(A4)
    document = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=12 * mm,
        rightMargin=12 * mm,
        topMargin=13 * mm,
        bottomMargin=14 * mm,
        title=f"Givera - {dataset['title']}",
        author="Givera administration",
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "GiveraTitle", parent=styles["Title"], fontName=font_name,
        fontSize=20, leading=24, textColor=colors.HexColor("#25194B"), alignment=TA_CENTER,
    )
    meta_style = ParagraphStyle(
        "GiveraMeta", parent=styles["Normal"], fontName=font_name,
        fontSize=8, leading=11, textColor=colors.HexColor("#64748B"), alignment=TA_CENTER,
    )
    cell_style = ParagraphStyle(
        "GiveraCell", parent=styles["BodyText"], fontName=font_name,
        fontSize=6.8, leading=8.5, textColor=colors.HexColor("#334155"),
    )
    header_style = ParagraphStyle(
        "GiveraHeader", parent=cell_style, textColor=colors.white, fontSize=7, leading=8.5,
    )

    available_width = page_width - 24 * mm
    weight_total = sum(dataset["widths"])
    column_widths = [available_width * weight / weight_total for weight in dataset["widths"]]
    table_data = [
        [Paragraph(escape(str(value)), header_style) for value in dataset["headers"]],
        *[[Paragraph(escape(str(value or "-")), cell_style) for value in row] for row in dataset["rows"]],
    ]
    if not dataset["rows"]:
        table_data.append([Paragraph("No records available", cell_style)] + [""] * (len(dataset["headers"]) - 1))

    table = Table(table_data, colWidths=column_widths, repeatRows=1, hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6F52D9")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#E2E8F0")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("SPAN", (0, 1), (-1, 1)) if not dataset["rows"] else ("LINEBELOW", (0, 0), (-1, 0), 0, colors.white),
        ("ALIGN", (0, 1), (-1, 1), "CENTER") if not dataset["rows"] else ("ALIGN", (0, 0), (-1, 0), "LEFT"),
    ]))

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont(font_name, 7)
        canvas.setFillColor(colors.HexColor("#94A3B8"))
        canvas.drawString(12 * mm, 7 * mm, "Givera administration export")
        canvas.drawRightString(page_width - 12 * mm, 7 * mm, f"Page {doc.page}")
        canvas.restoreState()

    generated = timezone.localtime().strftime("%Y-%m-%d %H:%M")
    story = [
        Paragraph(dataset["title"], title_style),
        Spacer(1, 2 * mm),
        Paragraph(f"Generated {generated} - {len(dataset['rows'])} records", meta_style),
        Spacer(1, 6 * mm),
        table,
    ]
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="{filename}.pdf"'
    return response
