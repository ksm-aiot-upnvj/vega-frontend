// ============================================
// VEGA LMS — Course, Module, Lesson Types
// ============================================

export type LessonType = "TEXT" | "VIDEO" | "PDF" | "FILE" | "LINK" | "TASK" | "QUIZ";

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  course_count: number;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url?: string;
  category_id: string;
  category?: Category;
  mentor_id: string;
  mentor_name: string;
  mentor_avatar?: string;
  level: CourseLevel;
  status: CourseStatus;
  estimated_duration: number; // in minutes
  total_modules: number;
  total_lessons: number;
  enrolled_count: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order: number;
  deadline?: string | null;
  lessons: Lesson[];
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content?: string;
  content_url?: string;
  lesson_type: LessonType;
  order: number;
  duration: number; // in minutes
  is_completed?: boolean;
  task_code?: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  course?: Course;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  enrolled_at: string;
  completed_at?: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  completed_at: string;
}

export interface CourseWithModules extends Course {
  modules: Module[];
}

export interface EnrolledCourse extends Course {
  enrollment: Enrollment;
}
