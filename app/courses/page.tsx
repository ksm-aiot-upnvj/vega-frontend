"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import { mockCourses, mockEnrollments, mockCategories } from "@/lib/mock-data";
import { Search, Filter, BookOpen } from "lucide-react";

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Build enrollment map for progress display
  const enrollmentMap = useMemo(() => {
    const map = new Map<string, number>();
    mockEnrollments.forEach((e) => {
      map.set(e.course_id, e.progress_percentage);
    });
    return map;
  }, []);

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Katalog <span className="text-gradient">Course</span>
          </h1>
          <p className="text-text-muted mt-1">
            Temukan course yang sesuai dengan minatmu
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-primary-800 border border-border-secondary rounded-xl px-4 py-2.5">
            <Search size={16} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-muted flex-shrink-0" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                    : "bg-primary-800 text-text-muted border border-border-secondary hover:text-text-primary"
                }`}
              >
                Semua
              </button>
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-accent-500/20 text-accent-300 border border-accent-500/30"
                      : "bg-primary-800 text-text-muted border border-border-secondary hover:text-text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-text-muted">
          Menampilkan {filteredCourses.length} course
        </p>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                progress={enrollmentMap.get(course.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen className="h-7 w-7 text-text-muted" />}
            title="Course tidak ditemukan"
            description="Coba ubah kata kunci atau filter kategori"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
