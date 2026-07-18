export type DocumentFile = {
  id: string;
  label: string;
  fileName: string;
  format: string;
  size: string;
};

export type AnnualReport = {
  id: string;
  year: string;
  title: string;
  publishedDate: string;
  fiscalYear: string;
  totalFunds: string;
  programAllocation: string;
  allocationDetail: string;
  campaignName: string;
  campaignFunds: string;
  campaignAllocation: string;
  auditReference: string;
  documents: DocumentFile[];
};

export const annualReports: AnnualReport[] = [
{
  id: "report-2026",
  year: "2026",
  title: "Annual Report",
  publishedDate: "January 15, 2027",
  fiscalYear: "Fiscal Year 2026",
  totalFunds: "$12.8M",
  programAllocation: "94.2%",
  allocationDetail: "Across 48 verified campaigns",
  campaignName: "Coastal Flood Response 2026",
  campaignFunds: "$246,800",
  campaignAllocation: "81%",
  auditReference: "Audit record AR-26-041 available",
  documents: [
  { id: "annual", label: "Full Annual Report", fileName: "givera-annual-report-2026.pdf", format: "PDF", size: "4.8 MB" },
  { id: "financials", label: "Financial Statements", fileName: "givera-financial-statements-2026.pdf", format: "PDF", size: "1.2 MB" },
  { id: "audit", label: "Independent Audit Report", fileName: "givera-audit-report-2026.pdf", format: "PDF", size: "860 KB" }]

},
{
  id: "report-2025",
  year: "2025",
  title: "Annual Report",
  publishedDate: "January 18, 2026",
  fiscalYear: "Fiscal Year 2025",
  totalFunds: "$10.4M",
  programAllocation: "93.6%",
  allocationDetail: "Across 41 verified campaigns",
  campaignName: "Winter Shelter Network 2025",
  campaignFunds: "$188,400",
  campaignAllocation: "88%",
  auditReference: "Audit record AR-25-039 available",
  documents: [
  { id: "annual", label: "Full Annual Report", fileName: "givera-annual-report-2025.pdf", format: "PDF", size: "4.2 MB" },
  { id: "financials", label: "Financial Statements", fileName: "givera-financial-statements-2025.pdf", format: "PDF", size: "1.1 MB" },
  { id: "audit", label: "Independent Audit Report", fileName: "givera-audit-report-2025.pdf", format: "PDF", size: "790 KB" }]

},
{
  id: "report-2024",
  year: "2024",
  title: "Annual Report",
  publishedDate: "January 22, 2025",
  fiscalYear: "Fiscal Year 2024",
  totalFunds: "$8.9M",
  programAllocation: "92.8%",
  allocationDetail: "Across 36 verified campaigns",
  campaignName: "Community Food Security 2024",
  campaignFunds: "$161,250",
  campaignAllocation: "85%",
  auditReference: "Audit record AR-24-031 available",
  documents: [
  { id: "annual", label: "Full Annual Report", fileName: "givera-annual-report-2024.pdf", format: "PDF", size: "3.9 MB" },
  { id: "financials", label: "Financial Statements", fileName: "givera-financial-statements-2024.pdf", format: "PDF", size: "980 KB" },
  { id: "audit", label: "Independent Audit Report", fileName: "givera-audit-report-2024.pdf", format: "PDF", size: "744 KB" }]

},
{
  id: "report-2023",
  year: "2023",
  title: "Annual Report",
  publishedDate: "January 20, 2024",
  fiscalYear: "Fiscal Year 2023",
  totalFunds: "$7.1M",
  programAllocation: "91.9%",
  allocationDetail: "Across 29 verified campaigns",
  campaignName: "Drought Relief Partnership 2023",
  campaignFunds: "$133,900",
  campaignAllocation: "78%",
  auditReference: "Audit record AR-23-022 available",
  documents: [
  { id: "annual", label: "Full Annual Report", fileName: "givera-annual-report-2023.pdf", format: "PDF", size: "3.4 MB" },
  { id: "financials", label: "Financial Statements", fileName: "givera-financial-statements-2023.pdf", format: "PDF", size: "870 KB" },
  { id: "audit", label: "Independent Audit Report", fileName: "givera-audit-report-2023.pdf", format: "PDF", size: "690 KB" }]

},
{
  id: "report-2022",
  year: "2022",
  title: "Annual Report",
  publishedDate: "January 25, 2023",
  fiscalYear: "Fiscal Year 2022",
  totalFunds: "$5.8M",
  programAllocation: "90.7%",
  allocationDetail: "Across 24 verified campaigns",
  campaignName: "Safe Water Initiative 2022",
  campaignFunds: "$98,600",
  campaignAllocation: "76%",
  auditReference: "Audit record AR-22-016 available",
  documents: [
  { id: "annual", label: "Full Annual Report", fileName: "givera-annual-report-2022.pdf", format: "PDF", size: "3.1 MB" },
  { id: "financials", label: "Financial Statements", fileName: "givera-financial-statements-2022.pdf", format: "PDF", size: "805 KB" },
  { id: "audit", label: "Independent Audit Report", fileName: "givera-audit-report-2022.pdf", format: "PDF", size: "640 KB" }]

}];