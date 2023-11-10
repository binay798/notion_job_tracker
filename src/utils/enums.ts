export function remapEnum(en: { [key: string]: string | number }) {
  return Object.values(en).filter((el) => typeof el !== 'number');
}

export function pgMapEnum(en: { [key: string]: string | number }) {
  const mappedData = remapEnum(en);

  return mappedData.map((el) => `'${el}'`);
}

export enum DirectoryName {
  projects = 'projects',
  company = 'company',
  customers = 'customers',
  companyLogo = 'company/logo',
  sites = 'sites',
  users = 'users',
  plans = 'plans',
  forms = 'forms',
  tickets = 'tickets',
  android = 'android-app',
}

export enum FileType {
  image = 'image',
  video = 'video',
  document = 'document',
}

export enum FontSize {
  'x-small' = 'x-small',
  small = 'small',
  medium = 'medium',
  large = 'large',
  'x-large' = 'x-large',
}

export enum FormStatus {
  draft = 'draft',
  published = 'published',
}

export enum ProjectType {
  quote = 'Quote',
  'days work' = 'Days Work',
}

export enum ProjectStatus {
  active = 'Active',
  completed = 'Completed',
  'to price' = 'To Price',
}

export enum ProjectPreliminary {
  fuel = 'fuel',
  item = 'item',
  transport = 'transport',
  'dynamic item' = 'dynamic item',
}
export enum QuoteStatus {
  draft = 'draft',
  published = 'published',
  declined = 'declined',
  accepted = 'accepted',
  voided = 'voided',
}

export enum QuoteDeliveryStatus {
  sent = 'sent',
  'not sent' = 'not sent',
}
export enum QuoteOrientation {
  portrait = 'portrait',
  landscape = 'landscape',
}

export enum SiteStatus {
  active = 'active',
  inactive = 'inactive',
  archived = 'archived',
}

export enum TicketStatus {
  open = 'open',
  'in progress' = 'in progress',
  feedback = 'feedback',
  completed = 'completed',
}

export enum UserRole {
  'System Admin' = 'System Admin',
  'Full User' = 'Full User',
  'Sub Contractor' = 'Sub Contractor',
  'operative' = 'operative',
}

export enum SiteVisitStatus {
  'to schecule' = 'to schedule',
  'to start' = 'to start',
  'in progress' = 'in progress',
  'labour complete' = 'labour complete',
  'to invoice' = 'to invoice',
  'to be approved' = 'to be approved',
  'invoiced' = 'invoiced',
  'voided' = 'voided',
}

export enum TicketLogType {
  comments = 'comments',
  attachments = 'attachments',
  'activity log' = 'activity log',
}

export enum InvoiceStatus {
  unpaid = 'unpaid',
  disputed = 'disputed',
  voided = 'voided',
  paid = 'paid',
}

export enum InvoiceType {
  draft = 'draft',
  approved = 'approved',
}

export const ENUMS = {
  fileType: {
    enum: FileType,
    name: 'file_type',
  },
  fontSize: {
    enum: FontSize,
    name: 'font_size',
  },
  formStatus: {
    enum: FormStatus,
    name: 'form_status',
  },
  invoiceStatus: {
    enum: InvoiceStatus,
    name: 'invoice_status',
  },
  invoiceType: {
    enum: InvoiceType,
    name: 'invoice_type',
  },
  userRole: {
    enum: UserRole,
    name: 'user_role',
  },
  projectType: {
    enum: ProjectType,
    name: 'project_type',
  },
  projectStatus: {
    enum: ProjectStatus,
    name: 'project_status',
  },
  siteStatus: {
    enum: SiteStatus,
    name: 'site_status',
  },
  siteVisitStatus: {
    enum: SiteVisitStatus,
    name: 'site_visit_status',
  },
  projectPreliminary: {
    enum: ProjectPreliminary,
    name: 'project_preliminary',
  },
  quoteStatus: {
    enum: QuoteStatus,
    name: 'quote_status',
  },
  quoteDeliveryStatus: {
    enum: QuoteDeliveryStatus,
    name: 'quote_delivery_status',
  },
  quoteOrientation: {
    enum: QuoteOrientation,
    name: 'quote_orientation',
  },
  ticketStatus: {
    enum: TicketStatus,
    name: 'ticket_status',
  },
  ticketLog: {
    enum: TicketLogType,
    name: 'ticket_log_type',
  },
};
