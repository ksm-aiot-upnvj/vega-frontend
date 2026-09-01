// ============================================
// VEGA LMS — API Client
// Centralized API communication layer
// ============================================

import type { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types/user";
import type { Course, CourseWithModules, Enrollment, Category } from "@/types/course";
import type { Quiz, Question, QuizResult } from "@/types/quiz";
import type { AssignmentWithSubmission } from "@/types/assignment";

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
// Auth API
// ============================================

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const formData = new URLSearchParams();
  formData.append("username", data.email);
  formData.append("password", data.password);

  const tokenData = await apiFetch<{ access_token: string; token_type: string }>(
    "/api/v1/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    }
  );

  // set token temporarily to fetch user
  if (typeof window !== "undefined") {
    localStorage.setItem("vega_token", tokenData.access_token);
  }

  const user = await getCurrentUser();

  return {
    access_token: tokenData.access_token,
    refresh_token: "", // not implemented in backend yet
    token_type: tokenData.token_type,
    user: user,
  };
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  await apiFetch<User>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  // After register, automatically log in
  return login({ email: data.email, password: data.password });
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>("/api/v1/users/me");
}

// ============================================
// Course API
// ============================================

export async function getCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/api/v1/courses/");
}

export async function getCourseById(id: string): Promise<CourseWithModules> {
  return apiFetch<CourseWithModules>(`/api/v1/courses/${id}`);
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  return apiFetch<Course>("/api/v1/courses/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string): Promise<Course> {
  return apiFetch<Course>(`/api/v1/courses/${id}`, {
    method: "DELETE",
  });
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/v1/categories/");
}

// ============================================
// Enrollment API
// ============================================

export async function getMyEnrollments(): Promise<Enrollment[]> {
  return apiFetch<Enrollment[]>("/api/v1/enrollments/me");
}

export async function enrollCourse(courseId: string): Promise<Enrollment> {
  return apiFetch<Enrollment>("/api/v1/enrollments/", {
    method: "POST",
    body: JSON.stringify({ course_id: courseId }),
  });
}

// ============================================
// Progress API (Mocked for now as we didn't implement lesson completion)
// ============================================

export async function completeLesson(lessonId: string): Promise<{ success: boolean }> {
  // Replace with real API endpoint later
  return { success: true };
}

// ============================================
// Quiz API
// ============================================

export async function getQuiz(quizId: string): Promise<Quiz> {
  return apiFetch<Quiz>(`/api/v1/quizzes/${quizId}`);
}

export async function getQuizQuestions(quizId: string): Promise<Question[]> {
  return apiFetch<Question[]>(`/api/v1/quizzes/${quizId}/questions`);
}

export async function submitQuizAttempt(
  quizId: string,
  answers: { question_id: string; selected_option_ids: string[] }[]
): Promise<QuizResult> {
  // Basic mock check, replace logic when needed
  return apiFetch<QuizResult>(`/api/v1/quizzes/${quizId}/submit`, {
    method: "POST",
    body: JSON.stringify({
      score: 80,
      total_points: 100,
      percentage: 80,
      passed: true
    }),
  });
}

// ============================================
// Assignment API
// ============================================

export async function getAssignments(): Promise<AssignmentWithSubmission[]> {
  return apiFetch<AssignmentWithSubmission[]>("/api/v1/assignments/");
}

// ============================================
// Admin API
// ============================================

export async function getAllUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/v1/users/");
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return apiFetch<User>(`/api/v1/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<User> {
  return apiFetch<User>(`/api/v1/users/${id}`, {
    method: "DELETE",
  });
}

export const updateMe = async (data: any) => {
  return apiFetch<User>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const updatePassword = async (data: any) => {
  return apiFetch<User>("/api/v1/users/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// Export base fetch for future real API integration
export { apiFetch, API_BASE_URL };
