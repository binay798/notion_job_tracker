import path from 'path';

export const PUBLIC_PATH = path.join(process.env.ROOT_PATH as string, process.env.PUBLIC_PATH as string);
export const ROLE = {
  user: 'user',
  admin: 'admin',
  all: ['user', 'admin'],
};

export const TABLE = {
  users: 'users',
};

export const HEADINGS = {
  coverLetter: 'Cover letter',
  sponsorshipNeededInFuture: 'Sponsorship Needed In Future?',
  nextFollowup: 'Next Follow-up',
  followupCount: 'Follow up count',
  priority: 'Priority',
  workModel: 'Work Model',
  isGhosted: 'Is Ghosted',
  resume: 'Resume',
  jobPostingUrl: 'Job Posting URL',
  roleTitle: 'Role Title',
  roleType: 'Role Type',
  applicationStatus: 'Application Status',
  inJobMailOrPhone: 'In job mail/phone',
  dateApplied: 'Date Applied',
  sponsorWillingness: 'Sponsor Willingness (claimed)',
  source: 'Source',
  company: 'Company',
  jobDescription: 'Job Description',
  resumeHtml: 'Resume html',
  processed: 'Processed',
};

export const HEADING_IDS = {
  [HEADINGS.coverLetter]: '%3EfeP',
  [HEADINGS.sponsorshipNeededInFuture]: '%3FDB%5B',
  [HEADINGS.nextFollowup]: 'Dsdl',
  [HEADINGS.followupCount]: 'G%7Ca%3B',
  [HEADINGS.priority]: 'I%3Cd%5C',
  [HEADINGS.workModel]: 'JLQX',
  [HEADINGS.isGhosted]: 'PSuV',
  [HEADINGS.resume]: 'Rdo%3A',
  [HEADINGS.jobPostingUrl]: 'TwX%3E',
  [HEADINGS.roleTitle]: 'Vg%3Fy',
  [HEADINGS.jobDescription]: 'WoSr',
  [HEADINGS.roleType]: 'XQ~L',
  [HEADINGS.applicationStatus]: '%5CYP~',
  [HEADINGS.inJobMailOrPhone]: 'aJfZ',
  [HEADINGS.dateApplied]: 'e%7BH%60',
  [HEADINGS.sponsorWillingness]: 'gn%5Ed',
  [HEADINGS.source]: 'lvYj',
  [HEADINGS.resumeHtml]: '%7Dk_y',
  [HEADINGS.company]: 'title',
  [HEADINGS.processed]: 'xrv%40',
};
