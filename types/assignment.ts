// ============================================
// VEGA LMS — Assignment Types
// ============================================

export type SubmissionType = "FILE" | "URL" | "GITHUB";

export type SubmissionStatus = "PENDING" | "SUBMITTED" | "GRADED" | "REVISION_REQUESTED";

export interface Assignment {
  id: string;
  course_id: string;
  module_id?: string;
  title: string;
  description: string;
  instructions?: string;
  due_date?: string;
  max_score: number;
  accepted_types: SubmissionType[];
  created_at: string;
}

export interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  user_name?: string;
  submission_type: SubmissionType;
  file_url?: string;
  github_url?: string;
  link_url?: string;
  notes?: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
}

export interface AssignmentWithSubmission extends Assignment {
  submission?: Submission;
  course_title: string;
}
