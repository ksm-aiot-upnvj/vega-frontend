// ============================================
// VEGA LMS — API Client
// Centralized API communication layer
// Currently uses mock data, ready for backend swap
// ============================================

import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/user";
import type { Course, CourseWithModules, Enrollment } from "@/types/course";
import type { Quiz, Question, QuizResult } from "@/types/quiz";
import type { AssignmentWithSubmission } from "@/types/assignment";
import {
  mockCourses,
  mockEnrollments,
  mockCourseDetail,
  mockQuiz,
  mockQuizQuestions,
  mockAssignments,
  mockCurrentUser,
  mockAllUsers,
  mockCategories,
} from "./mock-data";
import { delay } from "./utils";

// ---- Configuration ----
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---- Base Fetch ----
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("vega_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================
// Auth API (Mock)
// ============================================

export async function login(data: LoginRequest): Promise<AuthResponse> {
  await delay(800);
  // Mock: accept any credentials
  return {
    access_token: "mock-jwt-token-" + Date.now(),
    refresh_token: "mock-refresh-token-" + Date.now(),
    token_type: "Bearer",
    user: mockCurrentUser,
  };
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  await delay(1000);
  return {
    access_token: "mock-jwt-token-" + Date.now(),
    refresh_token: "mock-refresh-token-" + Date.now(),
    token_type: "Bearer",
    user: {
      ...mockCurrentUser,
      nim: data.nim,
      name: data.name,
      email: data.email,
      interest: data.interest,
    },
  };
}

export async function getCurrentUser(): Promise<User> {
  await delay(300);
  return mockCurrentUser;
}

// ============================================
// Course API (Mock)
// ============================================

export async function getCourses(): Promise<Course[]> {
  await delay(500);
  return mockCourses;
}

export async function getCourseById(id: string): Promise<CourseWithModules> {
  await delay(400);
  const course = mockCourses.find((c) => c.id === id);
  if (!course) throw new Error("Course not found");
  return { ...course, modules: mockCourseDetail.modules };
}

export async function getCategories() {
  await delay(300);
  return mockCategories;
}

// ============================================
// Enrollment API (Mock)
// ============================================

export async function getMyEnrollments(): Promise<Enrollment[]> {
  await delay(400);
  return mockEnrollments;
}

export async function enrollCourse(courseId: string): Promise<Enrollment> {
  await delay(600);
  return {
    id: "e-new-" + Date.now(),
    user_id: "u-001",
    course_id: courseId,
    progress_percentage: 0,
    completed_lessons: 0,
    total_lessons: 8,
    enrolled_at: new Date().toISOString(),
  };
}

// ============================================
// Progress API (Mock)
// ============================================

export async function completeLesson(lessonId: string): Promise<{ success: boolean }> {
  await delay(500);
  return { success: true };
}

// ============================================
// Quiz API (Mock)
// ============================================

export async function getQuiz(quizId: string): Promise<Quiz> {
  await delay(400);
  return mockQuiz;
}

export async function getQuizQuestions(quizId: string): Promise<Question[]> {
  await delay(500);
  return mockQuizQuestions;
}

export async function submitQuizAttempt(
  quizId: string,
  answers: { question_id: string; selected_option_ids: string[] }[]
): Promise<QuizResult> {
  await delay(1000);
  return {
    attempt_id: "attempt-" + Date.now(),
    quiz_id: quizId,
    quiz_title: mockQuiz.title,
    score: 80,
    total_points: 100,
    percentage: 80,
    passed: true,
    submitted_at: new Date().toISOString(),
    question_results: mockQuizQuestions.map((q, i) => ({
      question_id: q.id,
      question_text: q.question_text,
      is_correct: i !== 2,
      points_earned: i !== 2 ? q.points : 0,
      points_possible: q.points,
      selected_option_ids: answers[i]?.selected_option_ids || [],
      correct_option_ids: [q.options[1]?.id || ""],
    })),
  };
}

// ============================================
// Assignment API (Mock)
// ============================================

export async function getAssignments(): Promise<AssignmentWithSubmission[]> {
  await delay(500);
  return mockAssignments;
}

// ============================================
// Admin API (Mock)
// ============================================

export async function getAllUsers(): Promise<User[]> {
  await delay(500);
  return mockAllUsers;
}

// Export base fetch for future real API integration
export { apiFetch, API_BASE_URL };
