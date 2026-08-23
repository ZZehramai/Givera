from io import BytesIO
from xml.sax.saxutils import escape

from django.http import HttpResponse
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


PURPLE = colors.HexColor("#6F52D9")
DARK_PURPLE = colors.HexColor("#25194B")
YELLOW = colors.HexColor("#FFD66B")
SLATE = colors.HexColor("#64748B")


def donation_certificate_response(payment):
    # ReportLab's built-in font keeps the English certificate portable across
    # development and deployment environments without relying on local fonts.
    font_name = "Helvetica"
    page_width, page_height = landscape(A4)
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        leftMargin=28 * mm,
        rightMargin=28 * mm,
        topMargin=24 * mm,
        bottomMargin=22 * mm,
        title="Givera donation certificate",
        author="Givera",
        subject=f"Demo donation {payment.transaction_reference}",
    )
    styles = getSampleStyleSheet()
    brand = ParagraphStyle(
        "CertificateBrand",
        parent=styles["Title"],
        fontName=font_name,
        fontSize=17,
        leading=20,
        textColor=PURPLE,
        alignment=TA_CENTER,
        spaceAfter=4 * mm,
    )
    title = ParagraphStyle(
        "CertificateTitle",
        parent=styles["Title"],
        fontName=font_name,
        fontSize=29,
        leading=34,
        textColor=DARK_PURPLE,
        alignment=TA_CENTER,
        spaceAfter=5 * mm,
    )
    body = ParagraphStyle(
        "CertificateBody",
        parent=styles["BodyText"],
        fontName=font_name,
        fontSize=11,
        leading=17,
        textColor=SLATE,
        alignment=TA_CENTER,
    )
    name_style = ParagraphStyle(
        "CertificateName",
        parent=title,
        fontSize=22,
        leading=27,
        textColor=PURPLE,
        spaceAfter=3 * mm,
    )
    campaign_style = ParagraphStyle(
        "CertificateCampaign",
        parent=title,
        fontSize=18,
        leading=23,
        spaceAfter=4 * mm,
    )
    amount_style = ParagraphStyle(
        "CertificateAmount",
        parent=title,
        fontSize=24,
        leading=28,
        textColor=DARK_PURPLE,
        spaceAfter=5 * mm,
    )
    table_label = ParagraphStyle(
        "CertificateTableLabel",
        parent=body,
        fontSize=8,
        leading=10,
        textColor=SLATE,
    )
    table_value = ParagraphStyle(
        "CertificateTableValue",
        parent=body,
        fontSize=10,
        leading=13,
        textColor=DARK_PURPLE,
    )
    donor_name = (
        "Anonymous donor"
        if payment.is_anonymous
        else payment.donor.get_full_name() or payment.donor.username
    )
    completed_at = timezone.localtime(payment.completed_at or payment.created_at)
    details = Table(
        [[
            Paragraph("PAYMENT METHOD", table_label),
            Paragraph("REFERENCE ID", table_label),
            Paragraph("COMPLETED ON", table_label),
        ], [
            Paragraph(escape(payment.get_provider_display()), table_value),
            Paragraph(escape(payment.transaction_reference), table_value),
            Paragraph(completed_at.strftime("%d %B %Y"), table_value),
        ]],
        colWidths=[72 * mm, 72 * mm, 72 * mm],
    )
    details.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F7F5FF")),
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#DDD3FF")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E8E2FA")),
        ("TOPPADDING", (0, 0), (-1, 0), 7),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
        ("TOPPADDING", (0, 1), (-1, 1), 3),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))

    def decorate(canvas, _document):
        canvas.saveState()
        canvas.setStrokeColor(PURPLE)
        canvas.setLineWidth(2.2)
        canvas.roundRect(11 * mm, 11 * mm, page_width - 22 * mm, page_height - 22 * mm, 6 * mm)
        canvas.setStrokeColor(YELLOW)
        canvas.setLineWidth(0.9)
        canvas.roundRect(14 * mm, 14 * mm, page_width - 28 * mm, page_height - 28 * mm, 5 * mm)
        canvas.setFillColor(YELLOW)
        canvas.circle(22 * mm, page_height - 22 * mm, 3.2 * mm, fill=1, stroke=0)
        canvas.circle(page_width - 22 * mm, 22 * mm, 3.2 * mm, fill=1, stroke=0)
        canvas.restoreState()

    story = [
        Paragraph("GIVERA", brand),
        Paragraph("CERTIFICATE OF DONATION", title),
        Paragraph("This certificate recognizes", body),
        Spacer(1, 2 * mm),
        Paragraph(escape(donor_name), name_style),
        Paragraph("for supporting the campaign", body),
        Spacer(1, 2 * mm),
        Paragraph(escape(payment.campaign.title), campaign_style),
        Paragraph(f"{payment.amount:,.2f} Ks", amount_style),
        details,
        Spacer(1, 6 * mm),
        Paragraph(
            "DEMO DONATION CERTIFICATE — This document records a Givera payment simulation. No real funds were transferred.",
            body,
        ),
    ]
    document.build(story, onFirstPage=decorate)
    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename="givera-certificate-{payment.transaction_reference}.pdf"'
    )
    return response
