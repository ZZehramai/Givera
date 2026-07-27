export type CategoryType = 'Natural Disaster' | 'Underprivileged';

export type UrgencyLevel = 'Emergency Priority' | 'High Priority' | 'Standard';

export interface Campaign {
  id: string;
  title: string;
  organizer: string;       // Add this line
  organizerAvatar: string;
  category: string;
  location: string;
  image: any; 
  shortDescription: string;
  fullStory: string;
  raisedAmount: number;
  targetAmount: number;
  donorCount: number;
  daysLeft: number;
  featured: boolean;
  createdAt: string;
  updatesCount: number;    // Add this too (it's on line 24 of your code)
}

export interface CampaignRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  category: CategoryType;
  description: string;
  location: string;
  urgency: UrgencyLevel;
  goalAmount: number;
  proofDocumentName?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  adminFeedback?: string;
}

export interface Donation {
  id: string;
  campaignId: string;
  campaignTitle: string;
  category: CategoryType;
  donorId: string;
  donorName: string;
  donorEmail: string;
  isAnonymous: boolean;
  amount: number;
  tipAmount: number;
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Wire' | 'Crypto USDT';
  donatedAt: string;
  certificateId: string;
  taxDeductibleAmount: number;
}

export interface TaxCertificate {
  id: string;
  donationId: string;
  campaignTitle: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  issuedDate: string;
  serialNumber: string;
  taxExemptionCode: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means all users
  title: string;
  message: string;
  type: 'campaign_posted' | 'request_approved' | 'donation_received' | 'fund_report' | 'system';
  relatedCampaignId?: string;
  read: boolean;
  createdAt: string;
}

export interface FundReport {
  id: string;
  campaignId: string;
  campaignTitle: string;
  totalCollected: number;
  beneficiariesReached: number;
  completedAt: string;
  summary: string;
  breakdown: {
    item: string;
    amount: number;
    receiptRef: string;
  }[];
  auditedBy: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Donor' | 'Admin' | 'Volunteer';
  avatar: string;
  phone: string;
  joinedDate: string;
  totalDonated: number;
  campaignsCount: number;
  isVerified: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
