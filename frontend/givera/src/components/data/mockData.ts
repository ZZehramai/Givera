
export type CampaignCategory = "disaster" | "underprivileged";
export type CampaignStatus = "verified" | "in-review" | "urgent" | "completed";

export type Campaign = {
  id: string;
  slug: string;
  name: string;
  category: CampaignCategory;
  location: string;
  status: CampaignStatus;
  summary: string;
  goal: number;
  raised: number;
  allocated: number;
  donors: number;
  openedDate: string;
  reference: string;
};

export type DonorTransaction = {
  id: string;
  date: string;
  campaign: string;
  amount: number;
  method: string;
  status: "settled" | "processing" | "refunded";
  receipt: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  category: "disclosure" | "campaign" | "receipt" | "system" | "approval";
  unread: boolean;
};

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: "Donor" | "Campaign owner" | "Administrator";
  status: "Verified" | "Pending" | "Suspended";
  joined: string;
  contributions: number;
};

export type ReviewItem = {
  id: string;
  campaign: string;
  requester: string;
  category: CampaignCategory;
  submitted: string;
  requested: number;
  state: "Pending review" | "Needs revision" | "Approved";
};

export const formatCurrency = (value: number): string =>
new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

export const formatCompact = (value: number): string =>
new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const campaigns: Campaign[] = [
{
  id: "c-001",
  slug: "coastal-flood-response-2026",
  name: "Coastal Flood Response 2026",
  category: "disaster",
  location: "Gulf Coast, US",
  status: "urgent",
  summary: "Emergency shelter, clean water, and rebuilding support for communities displaced by record coastal flooding.",
  goal: 300000,
  raised: 246800,
  allocated: 81,
  donors: 3184,
  openedDate: "Mar 4, 2026",
  reference: "CMP-26-041"
},
{
  id: "c-002",
  slug: "wildfire-recovery-fund",
  name: "Northern Wildfire Recovery Fund",
  category: "disaster",
  location: "British Columbia, CA",
  status: "verified",
  summary: "Housing reconstruction and livelihood restoration for families affected by the summer wildfire season.",
  goal: 220000,
  raised: 158200,
  allocated: 74,
  donors: 2075,
  openedDate: "Feb 12, 2026",
  reference: "CMP-26-037"
},
{
  id: "c-003",
  slug: "earthquake-relief-anatolia",
  name: "Anatolia Earthquake Relief",
  category: "disaster",
  location: "Southern Türkiye",
  status: "verified",
  summary: "Medical aid, temporary housing, and structural safety assessments across impacted districts.",
  goal: 480000,
  raised: 421500,
  allocated: 88,
  donors: 5390,
  openedDate: "Jan 20, 2026",
  reference: "CMP-26-018"
},
{
  id: "c-004",
  slug: "school-meals-initiative",
  name: "School Meals Initiative",
  category: "underprivileged",
  location: "Nairobi County, KE",
  status: "verified",
  summary: "Daily nutritious meals and learning materials for children in under-resourced primary schools.",
  goal: 140000,
  raised: 112400,
  allocated: 86,
  donors: 1620,
  openedDate: "Feb 2, 2026",
  reference: "CMP-26-029"
},
{
  id: "c-005",
  slug: "safe-housing-program",
  name: "Safe Housing Program",
  category: "underprivileged",
  location: "Metro Manila, PH",
  status: "in-review",
  summary: "Transitional housing and skills training for families experiencing chronic housing insecurity.",
  goal: 190000,
  raised: 54300,
  allocated: 42,
  donors: 690,
  openedDate: "Apr 8, 2026",
  reference: "CMP-26-052"
},
{
  id: "c-006",
  slug: "clean-water-access",
  name: "Clean Water Access",
  category: "underprivileged",
  location: "Amhara Region, ET",
  status: "verified",
  summary: "Community wells, filtration, and maintenance training to deliver reliable safe drinking water.",
  goal: 160000,
  raised: 138900,
  allocated: 83,
  donors: 1980,
  openedDate: "Jan 9, 2026",
  reference: "CMP-26-011"
}];


export const donorTransactions: DonorTransaction[] = [
{ id: "t-1", date: "Jun 28, 2026", campaign: "Coastal Flood Response 2026", amount: 250, method: "Visa ·· 4821", status: "settled", receipt: "RCP-26-90412" },
{ id: "t-2", date: "May 14, 2026", campaign: "School Meals Initiative", amount: 120, method: "Visa ·· 4821", status: "settled", receipt: "RCP-26-88120" },
{ id: "t-3", date: "Apr 2, 2026", campaign: "Anatolia Earthquake Relief", amount: 500, method: "ACH ·· 0097", status: "settled", receipt: "RCP-26-85003" },
{ id: "t-4", date: "Mar 19, 2026", campaign: "Clean Water Access", amount: 75, method: "Visa ·· 4821", status: "refunded", receipt: "RCP-26-83771" },
{ id: "t-5", date: "Feb 27, 2026", campaign: "Northern Wildfire Recovery Fund", amount: 300, method: "PayPal", status: "settled", receipt: "RCP-26-81244" }];


export const donorNotifications: NotificationItem[] = [
{ id: "n-1", title: "Allocation update published", body: "Coastal Flood Response 2026 released a new fund allocation record for Q2.", time: "2h ago", category: "disclosure", unread: true },
{ id: "n-2", title: "Receipt available", body: "Your $250 contribution receipt (RCP-26-90412) is ready to download.", time: "2h ago", category: "receipt", unread: true },
{ id: "n-3", title: "Campaign milestone reached", body: "School Meals Initiative reached 80% of its funding goal.", time: "1d ago", category: "campaign", unread: false },
{ id: "n-4", title: "Annual report published", body: "The 2026 Annual Report is now available in the Transparency archive.", time: "3d ago", category: "disclosure", unread: false }];


export const adminNotifications: NotificationItem[] = [
{ id: "an-1", title: "Campaign awaiting review", body: "Safe Housing Program (CMP-26-052) is pending verification review.", time: "35m ago", category: "approval", unread: true },
{ id: "an-2", title: "Disclosure deadline", body: "Q2 allocation disclosure is due for 3 verified campaigns.", time: "4h ago", category: "disclosure", unread: true },
{ id: "an-3", title: "New campaign request", body: "A new underprivileged campaign request was submitted for triage.", time: "1d ago", category: "campaign", unread: false },
{ id: "an-4", title: "System export completed", body: "Monthly donor activity export finished and is ready for download.", time: "2d ago", category: "system", unread: false }];


export const managedUsers: ManagedUser[] = [
{ id: "u-1", name: "Amara Okafor", email: "amara.okafor@example.com", role: "Donor", status: "Verified", joined: "Jan 2025", contributions: 4120 },
{ id: "u-2", name: "Daniel Reyes", email: "d.reyes@example.com", role: "Campaign owner", status: "Verified", joined: "Mar 2025", contributions: 0 },
{ id: "u-3", name: "Mei Tanaka", email: "mei.tanaka@example.com", role: "Donor", status: "Verified", joined: "Aug 2025", contributions: 1875 },
{ id: "u-4", name: "Joseph Mwangi", email: "j.mwangi@example.com", role: "Campaign owner", status: "Pending", joined: "Apr 2026", contributions: 0 },
{ id: "u-5", name: "Lena Fischer", email: "lena.f@example.com", role: "Administrator", status: "Verified", joined: "Nov 2024", contributions: 0 },
{ id: "u-6", name: "Carlos Duarte", email: "carlos.d@example.com", role: "Donor", status: "Suspended", joined: "Jul 2025", contributions: 340 }];


export const reviewQueue: ReviewItem[] = [
{ id: "r-1", campaign: "Safe Housing Program", requester: "Joseph Mwangi", category: "underprivileged", submitted: "Apr 8, 2026", requested: 190000, state: "Pending review" },
{ id: "r-2", campaign: "Monsoon Relief Coalition", requester: "Priya Nair", category: "disaster", submitted: "Apr 6, 2026", requested: 260000, state: "Pending review" },
{ id: "r-3", campaign: "Youth Literacy Drive", requester: "Grace Adeyemi", category: "underprivileged", submitted: "Apr 1, 2026", requested: 95000, state: "Needs revision" },
{ id: "r-4", campaign: "Cyclone Shelter Rebuild", requester: "Ravi Kapoor", category: "disaster", submitted: "Mar 28, 2026", requested: 310000, state: "Approved" }];


export type MetricPoint = {label: string;value: number;};

export const allocationTrend: MetricPoint[] = [
{ label: "Jan", value: 89 },
{ label: "Feb", value: 90 },
{ label: "Mar", value: 91 },
{ label: "Apr", value: 92 },
{ label: "May", value: 93 },
{ label: "Jun", value: 94 }];


export const fundingByCategory: MetricPoint[] = [
{ label: "Disaster relief", value: 62 },
{ label: "Underprivileged", value: 31 },
{ label: "Operations", value: 7 }];


export const monthlyInflow: MetricPoint[] = [
{ label: "Jan", value: 1.2 },
{ label: "Feb", value: 1.6 },
{ label: "Mar", value: 2.1 },
{ label: "Apr", value: 1.9 },
{ label: "May", value: 2.4 },
{ label: "Jun", value: 2.8 }];


export const statusLabels: Record<CampaignStatus, string> = {
  verified: "Verified",
  "in-review": "In review",
  urgent: "Urgent",
  completed: "Completed"
};