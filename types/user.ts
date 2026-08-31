// ============================================
// VEGA LMS — User Types
// ============================================

export type UserRole = "ADMIN" | "MENTOR" | "MEMBER";

export interface User {
  id: string;
  nim: string;
  name: string;
  email: string;
  role: UserRole;
  interest: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nim: string;
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  interest: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface UserProfile extends User {
  enrolled_courses_count: number;
  completed_courses_count: number;
  total_lessons_completed: number;
  average_quiz_score: number;
}
