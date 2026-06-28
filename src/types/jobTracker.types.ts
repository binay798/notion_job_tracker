/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DBRowsProps {
  authors: { id: string; type: 'bot' | 'person' }[];
  entity: { id: string; type: string };
  type: string;
  data: {
    parent: {
      id: string;
      type: string;
      data_source_id: string;
    };
    updated_properties: string[];
  };
}

// --- Reusable Sub-Types ---

export interface RichTextAnnotation {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface RichTextItem {
  type: 'text';
  text: {
    content: string;
    link: string | null;
  };
  annotations: RichTextAnnotation;
  plain_text: string;
  href: string | null;
}

export interface NotionSelectOption {
  id: string;
  name: string;
  color: string;
}

export interface NotionDateRange {
  start: string;
  end: string | null;
  time_zone: string | null;
}

export interface NotionFileItem {
  name: string;
  type: 'file';
  file: {
    url: string;
    expiry_time: string;
  };
}

// --- Property Types ---

export interface RichTextProperty {
  id: string;
  type: 'rich_text';
  rich_text: RichTextItem[];
}

export interface CheckboxProperty {
  id: string;
  type: 'checkbox';
  checkbox: boolean;
}

export interface DateProperty {
  id: string;
  type: 'date';
  date: NotionDateRange | null;
}

export interface NumberProperty {
  id: string;
  type: 'number';
  number: number;
}

export interface SelectProperty {
  id: string;
  type: 'select';
  select: NotionSelectOption | null;
}

export interface StatusProperty {
  id: string;
  type: 'status';
  status: NotionSelectOption | null; // Status objects share the same structure as Select
}

export interface FilesProperty {
  id: string;
  type: 'files';
  files: NotionFileItem[];
}

export interface UrlProperty {
  id: string;
  type: 'url';
  url: string | null;
}

export interface TitleProperty {
  id: string;
  type: 'title';
  title: RichTextItem[];
}

// --- Main Interface ---

export interface JobApplicationProperties {
  'Cover letter': RichTextProperty;
  'Sponsorship Needed In Future?': CheckboxProperty;
  'Next Follow-up': DateProperty;
  'Follow up count': NumberProperty;
  Priority: SelectProperty;
  'Work Model': SelectProperty;
  'Is Ghosted': CheckboxProperty;
  Resume: FilesProperty;
  'Job Posting URL': UrlProperty;
  'Role Title': RichTextProperty;
  'Job Description': RichTextProperty;
  'Role Type': SelectProperty;
  'Application Status': StatusProperty;
  'In job mail/phone': RichTextProperty;
  'Date Applied': DateProperty;
  'Sponsor Willingness (claimed)': SelectProperty;
  Source: SelectProperty;
  'Resume html': RichTextProperty;
  Company: TitleProperty;
}
