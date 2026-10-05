export type StudentStatus = 'NEW' | 'WAITING' | 'JOINED' | 'REJECTED';

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
  internal_notes: string;
  submitted_at: string;
  updated_at: string;
  joined_at?: string;
  rejected_at?: string;
  custom_field_responses?: Record<string, string>;
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
}
