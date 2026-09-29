export type AdminRole = "SUPERUSER" | "ADMIN";

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttributionFields {
  leadSource: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  referrer: string | null;
  landingPage: string | null;
}

export interface ConsultationRow extends AttributionFields {
  id: string;
  type: "RESIDENTIAL" | "COMMERCIAL";
  location: string;
  projectStage: string;
  projectType: string | null;
  units: number | null;
  projectValueRange: string | null;
  targetDelivery: string | null;
  drawingsStatus: string | null;
  message: string;
  interestedIn: string[];
  status: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    whatsappNumber: string | null;
    preferredContact: string;
    company: string | null;
    jobTitle: string | null;
  };
  property: {
    propertyStatus: string;
    propertySize: string | null;
    expectedCompletion: string | null;
    budgetRange: string | null;
    address: string;
  } | null;
}

export interface ContactSubmissionRow extends AttributionFields {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
  createdAt: string;
}

export interface PartnershipSubmissionRow extends AttributionFields {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
  createdAt: string;
}

export interface CareSubmissionRow extends AttributionFields {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string | null;
  company: string | null;
  role: string | null;
  clientType: string;
  existingSystems: string | null;
  location: string | null;
  preferredContact: string;
  services: string[];
  message: string;
  status: string;
  createdAt: string;
}

export interface ContactRow {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  company: string | null;
  role: string | null;
  leadSource: string | null;
  submissionCount: number;
  firstSubmissionAt: string;
  lastSubmissionAt: string;
  createdAt: string;
}

export interface CaseStudyRow {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  location: string | null;
  summary: string;
  challenge: string | null;
  requirement: string | null;
  solution: string | null;
  outcome: string | null;
  services: string[];
  images: string[];
  metrics: { value: string; label: string }[] | null;
  coverImage: string | null;
  published: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface OrgSettingsRow {
  id: string;
  businessName: string;
  supportEmail: string | null;
  partnershipEmail: string | null;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  logoUrl: string | null;
  contactEmails: { address: string; purpose: string }[] | null;
}
