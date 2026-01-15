export type ColumnType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'STATUS'
  | 'DATE'
  | 'PERSON'
  | 'CHECKBOX'
  | 'LINK'
  | 'EMAIL'
  | 'PHONE'
  | 'RATING'
  | 'TAGS'
  | 'TIMELINE'
  | 'FILE'
  | 'FORMULA';

export const COLUMN_TYPES: Record<ColumnType, { label: string; icon: string }> = {
  TEXT: { label: 'Text', icon: 'text' },
  LONG_TEXT: { label: 'Long Text', icon: 'align-left' },
  NUMBER: { label: 'Number', icon: 'hash' },
  STATUS: { label: 'Status', icon: 'circle' },
  DATE: { label: 'Date', icon: 'calendar' },
  PERSON: { label: 'Person', icon: 'user' },
  CHECKBOX: { label: 'Checkbox', icon: 'check-square' },
  LINK: { label: 'Link', icon: 'link' },
  EMAIL: { label: 'Email', icon: 'mail' },
  PHONE: { label: 'Phone', icon: 'phone' },
  RATING: { label: 'Rating', icon: 'star' },
  TAGS: { label: 'Tags', icon: 'tag' },
  TIMELINE: { label: 'Timeline', icon: 'clock' },
  FILE: { label: 'File', icon: 'file' },
  FORMULA: { label: 'Formula', icon: 'function' },
};

export const DEFAULT_STATUS_OPTIONS = [
  { id: 'not_started', label: 'Not Started', color: '#c4c4c4' },
  { id: 'working', label: 'Working on it', color: '#fdab3d' },
  { id: 'stuck', label: 'Stuck', color: '#e2445c' },
  { id: 'done', label: 'Done', color: '#00c875' },
];
