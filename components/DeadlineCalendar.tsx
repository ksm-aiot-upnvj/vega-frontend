"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeadlineEvent {
  date: string; // ISO date string
  title: string;
  course_title: string;
  id: string;
}

interface DeadlineCalendarProps {
  events: DeadlineEvent[];
  /** compact mode removes header title and reduces outer padding */
  compact?: boolean;
  /** called when a date is picked (for date-picker mode in course builder) */
  onPickDate?: (isoDate: string) => void;
  /** currently selected date (for date-picker mode) */
  pickedDate?: string;
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function toLocalDateStr(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function DeadlineCalendar({
  events,
  compact = false,
  onPickDate,
  pickedDate,
}: DeadlineCalendarProps) {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isPickerMode = !!onPickDate;

  // Map "YYYY-MM-DD" -> events[]
  const eventMap = useMemo(() => {
    const map: Record<string, DeadlineEvent[]> = {};
    for (const ev of events) {
      if (!ev.date) continue;
      const key = toLocalDateStr(ev.date);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const todayStr = toLocalDateStr(today.toISOString());
  const pickedStr = pickedDate ? toLocalDateStr(pickedDate) : undefined;

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateKey(day: number) {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleDayClick(day: number) {
    const key = dateKey(day);
    if (isPickerMode) {
      // In date-picker mode, call onPickDate with ISO datetime (noon local)
      const iso = `${key}T12:00:00`;
      onPickDate!(iso);
    } else {
      setSelectedDate(selectedDate === key ? null : key);
    }
  }

  const selectedEvents = selectedDate ? (eventMap[selectedDate] ?? []) : [];
  const upcomingKeys = Object.keys(eventMap).filter((k) => k >= todayStr).sort();

  return (
    <div className={cn("space-y-3", !compact && "glass-card p-5")}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-2 mb-1">
          <CalendarDays size={18} className="text-accent-400" />
          <h2 className="text-lg font-semibold text-text-primary">Kalender Deadline</h2>
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-primary-700 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-semibold text-text-primary">
          {MONTHS[currentMonth]} {currentYear}
        </span>
        <button
          onClick={nextMonth}
          className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-primary-700 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[9px] font-semibold text-text-muted py-0.5">
            {d}
          </div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const key = dateKey(day);
          const hasEvent = !!eventMap[key];
          const isToday = key === todayStr;
          const isSelected = isPickerMode ? key === pickedStr : key === selectedDate;
          const isPast = key < todayStr;

          return (
            <button
              key={idx}
              onClick={() => handleDayClick(day)}
              className={cn(
                "relative flex flex-col items-center justify-start pt-0.5 h-8 rounded-lg text-[11px] font-medium transition-all",
                isSelected
                  ? isPickerMode
                    ? "bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/50"
                    : "bg-accent-500/20 text-accent-300 ring-1 ring-accent-500/40"
                  : isToday
                  ? "bg-accent-600/30 text-accent-300 font-bold"
                  : isPast
                  ? "text-text-muted/50 hover:bg-primary-700/40"
                  : "text-text-secondary hover:bg-primary-700/60"
              )}
            >
              <span>{day}</span>
              {hasEvent && (
                <span
                  className={cn(
                    "block w-1 h-1 rounded-full mt-0.5",
                    isPast ? "bg-text-muted/40" : "bg-rose-400"
                  )}
                />
              )}
              {isPickerMode && isSelected && !hasEvent && (
                <span className="block w-1 h-1 rounded-full mt-0.5 bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Date Events (view mode only) */}
      {!isPickerMode && selectedDate && (
        <div className="border-t border-border-secondary pt-2 space-y-1.5">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">
            {selectedEvents.length > 0 ? `Deadline – ${selectedDate}` : "Tidak ada deadline"}
          </p>
          {selectedEvents.map((ev) => (
            <div key={ev.id} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-text-primary truncate">{ev.title}</p>
                <p className="text-[10px] text-text-muted truncate">{ev.course_title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming deadlines (view mode, no date selected) */}
      {!isPickerMode && !selectedDate && (
        <div className="border-t border-border-secondary pt-2 space-y-1.5">
          {upcomingKeys.length > 0 ? (
            <>
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Deadline Mendatang</p>
              {upcomingKeys.slice(0, 3).flatMap((key) =>
                eventMap[key].map((ev) => {
                  const d = new Date(ev.date);
                  const label = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
                  return (
                    <div key={ev.id} className="flex items-start gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                      <span className="flex-shrink-0 text-[9px] font-bold text-rose-400 bg-rose-500/15 px-1.5 py-0.5 rounded">
                        {label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-text-primary truncate">{ev.title}</p>
                        <p className="text-[10px] text-text-muted truncate">{ev.course_title}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <p className="text-[11px] text-text-muted italic text-center">Tidak ada deadline mendatang 🎉</p>
          )}
        </div>
      )}
    </div>
  );
}
