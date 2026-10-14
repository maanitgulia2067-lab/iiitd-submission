export interface User {
  user_id: string;
  name: string;
  email: string;
  headline?: string;
  bio?: string;
  college_id?: string;
  college_name?: string;
  college_short_name?: string;
  college_location?: string;
  availability_hours?: number;
  collaboration_mode?: 'Remote' | 'Hybrid' | 'In-person' | string;
  verification_status?: 'Verified' | 'Self-Declared' | string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  avatar_url?: string;
  skills?: SkillItem[];
  interests?: InterestItem[];
  projects?: {
    project_id: string;
    title: string;
    category: string;
    status: string;
    role: string;
  }[];
  match_score?: number;
  role_fit?: number;
  interest_fit?: number;
  learning_fit?: number;
  availability_fit?: number;
  explanations?: string[];
  summary_explanation?: string;
  shared_skills?: string[];
  shared_interests?: string[];
}

export interface SkillItem {
  skill_id: string;
  name: string;
  category: string;
  proficiency?: string;
  can_contribute: boolean;
  wants_to_learn: boolean;
}

export interface InterestItem {
  interest_id: string;
  name: string;
  category: string;
}

export interface ProjectRequirement {
  requirement_id: string;
  project_id: string;
  skill_id: string;
  skill_name: string;
  skill_category?: string;
  role_name: string;
  positions_required: number;
  positions_filled: number;
}

export interface ProjectMember {
  membership_id: string;
  user_id: string;
  name: string;
  headline?: string;
  avatar_url?: string;
  college_name?: string;
  role: string;
  status: string;
  joined_at: string;
}

export interface ProjectTask {
  task_id: string;
  project_id: string;
  title: string;
  description?: string;
  assigned_user_id?: string;
  assigned_user_name?: string;
  due_date?: string;
  status: 'Todo' | 'In Progress' | 'Done';
}

export interface ProjectMilestone {
  milestone_id: string;
  project_id: string;
  title: string;
  due_date?: string;
  status: 'Pending' | 'Completed';
}

export interface ProjectResource {
  resource_id: string;
  project_id: string;
  title: string;
  url: string;
  resource_type: string;
}

export interface Project {
  project_id: string;
  creator_id: string;
  creator_name?: string;
  creator_college?: string;
  creator_college_full?: string;
  my_role?: string;
  title: string;
  tagline?: string;
  description: string;
  problem_statement?: string;
  category: string;
  project_stage: string;
  status: string;
  expected_commitment: string;
  collaboration_mode: string;
  visibility: string;
  repository_url?: string;
  demo_url?: string;
  showcase_featured?: boolean;
  created_at: string;
  requirements?: ProjectRequirement[];
  members?: ProjectMember[];
  tasks?: ProjectTask[];
  milestones?: ProjectMilestone[];
  resources?: ProjectResource[];
  open_roles_count?: number;
  match_score?: number;
  role_fit?: number;
  interest_fit?: number;
  learning_fit?: number;
  availability_fit?: number;
  matched_skills?: string[];
  matched_roles?: string[];
  explanations?: string[];
  summary_explanation?: string;
}

export interface CollaborationRequest {
  request_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_headline?: string;
  sender_college?: string;
  recipient_id: string;
  recipient_name?: string;
  project_id?: string;
  project_title?: string;
  role_name?: string;
  request_type: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  created_at: string;
}

export interface Club {
  club_id: string;
  college_id: string;
  college_name: string;
  college_short_name: string;
  name: string;
  category: string;
  description: string;
  lead_name?: string;
  verification_status: string;
  contact_email?: string;
  member_count: number;
  website?: string;
}

export interface ClubPartnership {
  partnership_id: string;
  sender_club_id: string;
  sender_club_name: string;
  sender_college: string;
  recipient_club_id: string;
  recipient_club_name: string;
  recipient_college: string;
  title: string;
  proposal: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  created_at: string;
}

export interface EventItem {
  event_id: string;
  organizer_id?: string;
  organizer_name?: string;
  title: string;
  category: string;
  description: string;
  start_time: string;
  venue: string;
  mode: string;
  eligibility: string;
  registration_url?: string;
  deadline?: string;
}

export interface NotificationItem {
  notification_id: string;
  recipient_id: string;
  type: string;
  message: string;
  related_entity_id?: string;
  read_status: boolean;
  created_at: string;
}

export interface College {
  college_id: string;
  name: string;
  short_name: string;
  location: string;
  website?: string;
}

export type ProjectMatch = Project;
