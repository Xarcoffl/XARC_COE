export type StudentStatus =
  | 'NEW'
  | 'WAITING'
  | 'JOINED'
  | 'REJECTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ON_HOLD'
  | 'INTEREST'
  | (string & {});

export type ExperienceLevel = 'New to XR' | 'Beginner' | 'Intermediate' | 'Experienced';

export type ProjectCategory = 'ALL' | 'AR' | 'VR' | 'MR' | 'XR' | '3D' | 'SIMULATION';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export type AchievementCategory =
  | 'Hackathon'
  | 'Competition'
  | 'Conference'
  | 'Internship'
  | 'Patent'
  | 'Award'
  | 'Certification'
  | 'Project'
  | 'Placement / PPO';

export type IndustryCategory =
  | 'Partner'
  | 'MoU'
  | 'Industrial Visit'
  | 'Expert Session'
  | 'Internship Collaboration'
  | 'Consultancy Project';

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'superadmin' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface RequestStatusConfig {
  key: string;
  label: string;
  color: string;
  description?: string;
  is_system?: boolean;
}

export interface ReviewChecklistItem {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface StudentRequest {
  id: string;
  full_name: string;
  register_number: string;
  department: string;
  year: string;
  section: string;
  email: string;
  college_email?: string; // backwards compatibility
  mobile_number: string;
  interests: string[];
  experience_level: ExperienceLevel;
  existing_skills: string;
  motivation: string;
  status: StudentStatus;
  form_type?: 'REQUEST' | 'INTEREST';
  internal_notes: string;
  submitted_at: string;
  updated_at: string;
  joined_at?: string;
  rejected_at?: string;
  custom_field_responses?: Record<string, string>;
  checklist_progress?: Record<string, boolean>;
}

export interface Vertical {
  id: string;
  slug: string;
  number: string;
  title: string;
  short_description: string;
  full_description: string;
  icon: string;
  outcomes: string[];
  tools: string[];
  opportunities: string[];
  is_published: boolean;
  order_index: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: 'AR' | 'VR' | 'MR' | 'XR' | '3D' | 'SIMULATION';
  cover_image: string;
  short_desc: string;
  full_desc: string;
  problem: string;
  solution: string;
  technologies: string[];
  team: string[];
  mentor: string;
  gallery: string[];
  video_url?: string;
  result_outcome: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  poster: string;
  start_date: string; // ISO date 'YYYY-MM-DD'
  end_date: string;   // ISO date 'YYYY-MM-DD'
  time: string;
  venue: string;
  registration_url?: string;
  short_desc: string;
  full_desc: string;
  highlights: string[];
  gallery: string[];
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  category: AchievementCategory;
  year: string;
  date: string;
  description: string;
  student_team: string;
  department: string;
  image: string;
  supporting_info?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface IndustryRecord {
  id: string;
  name: string;
  category: IndustryCategory;
  logo: string;
  description: string;
  date_or_term: string;
  collaboration_details: string;
  key_outcomes: string[];
  is_published: boolean;
  order_index: number;
}

export interface HomeContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    primary_cta_label: string;
    secondary_cta_label: string;
  };
  about_preview: {
    heading: string;
    description: string;
    pillars: Array<{
      tag: string;
      title: string;
      desc: string;
    }>;
  };
  verticals_preview: {
    heading: string;
    subheading: string;
  };
  featured_content: {
    heading: string;
  };
  journey: {
    heading: string;
    description: string;
  };
  join_cta: {
    heading: string;
    subheading: string;
    description: string;
    cta_label: string;
  };
}

export interface AboutContent {
  hero: {
    heading: string;
    subheading: string;
    description: string;
  };
  mission: string;
  vision: string;
  what_we_do: string[];
  coworking_title: string;
  coworking_description: string;
  multidisciplinary_desc: string;
  student_development_desc: string;
  industry_orientation_desc: string;
  roadmap: Array<{
    phase: string;
    title: string;
    description: string;
  }>;
}

export interface SiteSettings {
  institution_name: string;
  coe_name: string;
  tagline: string;
  site_title?: string;
  meta_description?: string;
  favicon_url?: string;
  contact_email: string;
  contact_phone: string;
  office_location: string;
  campus_address: string;
  working_hours: string;
  social_links: {
    linkedin?: string;
    github?: string;
    youtube?: string;
    twitter?: string;
  };
  footer_copyright?: string;
  footer_tagline?: string;
  registration_open?: boolean;
  custom_statuses?: RequestStatusConfig[];
  review_checklist?: ReviewChecklistItem[];
  departments?: string[];
  interest_options?: string[];
}

export interface CustomFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  placeholder?: string;
  required: boolean;
  options?: string[];
  help_text?: string;
}

export interface RequestFormContent {
  title: string;
  subtitle: string;
  guidelines_heading: string;
  guidelines_description: string;
  eligibility_criteria: string[];
  interest_options: string[];
  departments?: string[];
  keycard_title: string;
  keycard_badge: string;
  success_heading: string;
  success_message: string;
  custom_fields?: CustomFormField[];
}

export interface EmailTemplateConfig {
  subject: string;
  badge_text: string;
  headline: string;
  body_text?: string;
  next_steps?: string[];
  action_label?: string;
  action_url?: string;
  enabled?: boolean;
}

export interface EmailTemplatesSettings {
  joined: EmailTemplateConfig;
  waiting: EmailTemplateConfig;
  rejected: EmailTemplateConfig;
  announcement?: {
    default_subject: string;
    default_badge: string;
  };
  status_templates?: Record<string, EmailTemplateConfig>;
  [key: string]: any;
}

export interface EmailLog {
  id: string;
  recipient: string;
  student_name?: string;
  trigger_type: string;
  subject: string;
  status: 'SENT' | 'FAILED';
  message_id?: string;
  error?: string;
  sent_by?: string;
  timestamp: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  data_url: string; // Base64 data URL e.g. data:image/png;base64,...
  category?: 'projects' | 'events' | 'achievements' | 'branding' | 'general';
  created_at: string;
}

export interface DatabaseSchema {
  admin_users: AdminUser[];
  home_content: HomeContent;
  about_content: AboutContent;
  request_content?: RequestFormContent;
  settings: SiteSettings;
  verticals: Vertical[];
  projects: Project[];
  events: EventItem[];
  achievements: Achievement[];
  industry_records: IndustryRecord[];
  student_requests: StudentRequest[];
  email_templates?: EmailTemplatesSettings;
  email_logs?: EmailLog[];
  media_assets?: MediaAsset[];
  custom_student_groups?: CustomStudentGroup[];
}

export interface CustomStudentGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  student_ids: string[];
  created_at: string;
  updated_at?: string;
}

