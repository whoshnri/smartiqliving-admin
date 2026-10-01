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

export interface AnalyticsSummary {
  date: string;
  tzOffsetMinutes: number;
  totals: {
    visits: number;
    uniqueVisitors: number;
    previousVisits: number;
    /** null when there was no traffic the day before to compare against. */
    changePercent: number | null;
  };
  /** Always 24 entries, zero-filled, indexed by local hour. */
  hourly: { hour: number; visits: number }[];
  countries: { code: string | null; label: string; visits: number }[];
  sources: { source: string; visits: number }[];
}

export type BlogPostStatus = "DRAFT" | "PUBLISHED";

/**
 * An Editor.js document, exactly as `editor.save()` returns it. The API
 * rejects anything whose `blocks` is not an array.
 */
export interface EditorJsBlock {
  id?: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EditorJsDocument {
  time?: number;
  version?: string;
  blocks: EditorJsBlock[];
}

export interface BlogAuthorRow {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  /** Present on list responses; absent on the nested author of a post. */
  _count?: { posts: number };
}

export interface BlogCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: { posts: number };
}

/** List shape: deliberately excludes `content`, which the API omits. */
export interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  readingMinutes: number | null;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string };
  category: { id: string; name: string; slug: string } | null;
}

/** Detail shape used by the editor, including the full block document. */
export interface BlogPostDetail {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: EditorJsDocument;
  coverImage: string | null;
  coverImageAlt: string | null;
  status: BlogPostStatus;
  publishedAt: string | null;
  readingMinutes: number | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  /** Per-article CTA; each falls back to the site-wide default when null. */
  ctaTitle: string | null;
  ctaDescription: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  author: BlogAuthorRow;
  category: BlogCategoryRow | null;
  createdAt: string;
  updatedAt: string;
}
