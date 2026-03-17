"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────────────

type Filter = "all" | "active" | "completed";
type View = "list" | "calendar";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(key: string): string {
  const today = toDateKey(Date.now());
  const yesterday = toDateKey(Date.now() - 86400000);
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  const d = new Date(key + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Auth Page ───────────────────────────────────────────────────────────────

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<"login" | "signup" | null>(null);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) { setError("Enter email and password"); return; }
    setLoading("login");
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(null);
  }

  async function handleSignup() {
    if (!email || !password) { setError("Enter email and password"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading("signup");
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setLoading(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleLogin();
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-gray-200">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Ashley ToDoList</h1>
            <p className="text-gray-400 text-xs mb-6">Sign in or create an account</p>

            <form onSubmit={onSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition text-center"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition text-center"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Login & Sign Up buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading !== null}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
                >
                  {loading === "login" ? "Signing in..." : "Login"}
                </button>
                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={loading !== null}
                  className="flex-1 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-semibold py-3 rounded-xl transition-all active:scale-[0.98]"
                >
                  {loading === "signup" ? "Creating..." : "Sign Up"}
                </button>
              </div>
            </form>

            {error && (
              <p className="mt-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Todo App ────────────────────────────────────────────────────────────────

function TodoApp({ onLogout, userEmail }: { onLogout: () => void; userEmail: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<View>("list");

  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // ─── Derived ─────────────────────────────────────────────────────────────

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of filteredTasks) {
      const key = toDateKey(t.createdAt);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [filteredTasks]);

  const sortedDateKeys = useMemo(
    () => Object.keys(tasksByDate).sort((a, b) => b.localeCompare(a)),
    [tasksByDate]
  );

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return filteredTasks.filter((t) => toDateKey(t.createdAt) === selectedDate);
  }, [filteredTasks, selectedDate]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(calYear, calMonth);
    const firstDay = getFirstDayOfMonth(calYear, calMonth);
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calYear, calMonth]);

  const taskCountByDay = useMemo(() => {
    const counts: Record<number, { total: number; active: number; completed: number }> = {};
    for (const t of tasks) {
      const d = new Date(t.createdAt);
      if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
        const day = d.getDate();
        if (!counts[day]) counts[day] = { total: 0, active: 0, completed: 0 };
        counts[day].total++;
        if (t.completed) counts[day].completed++;
        else counts[day].active++;
      }
    }
    return counts;
  }, [tasks, calYear, calMonth]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  function addTask() {
    if (!input.trim()) return;
    setTasks((prev) => [
      { id: Date.now(), text: input.trim(), completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
  }

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
    setSelectedDate(null);
  }

  function handleDayClick(day: number) {
    const key = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate((prev) => (prev === key ? null : key));
  }

  const todayKey = toDateKey(Date.now());
  const todayDate = new Date();

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-gray-200">

      {/* ── Outer Shell ───────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-lg">

        {/* ── Top Bento: Title + Progress ─────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Title card */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Ashley ToDoList</h1>
              <button
                onClick={onLogout}
                className="text-[11px] text-gray-400 hover:text-gray-900 font-medium transition px-2 py-1 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-2 truncate">
              {userEmail} &middot; {DAYS[todayDate.getDay()]}, {MONTHS[todayDate.getMonth()]} {todayDate.getDate()}
            </p>
          </div>

          {/* Progress ring card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#f3f4f6" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke="url(#progressGrad)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(progress / 100) * 150.8} 150.8`}
                  className="transition-all duration-700"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#111827" />
                    <stop offset="100%" stopColor="#4b5563" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-gray-800 text-xs font-bold">
                {progress}%
              </span>
            </div>
            <p className="text-gray-400 text-[10px] mt-1.5 font-medium">Progress</p>
          </div>
        </div>

        {/* ── Stat Pills ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 font-medium">Total</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 font-medium">Pending</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 font-medium">Done</p>
          </div>
        </div>

        {/* ── Main Card ───────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

          {/* Input + Controls */}
          <div className="p-4">
            {/* Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a new task..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition"
              />
              <button
                onClick={addTask}
                disabled={!input.trim()}
                className="bg-gray-900 hover:bg-gray-800 disabled:opacity-20 text-white text-sm font-semibold px-5 rounded-xl transition-all active:scale-95"
              >
                Add
              </button>
            </div>

            {/* View toggle + filter row */}
            <div className="flex gap-2">
              {/* View tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
                {(["list", "calendar"] as View[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                      view === v
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {v === "list" ? "List" : "Calendar"}
                  </button>
                ))}
              </div>

              {/* Filters */}
              <div className="flex-1 flex bg-gray-100 rounded-xl p-1 gap-0.5">
                {(["all", "active", "completed"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                      filter === f
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* ── LIST VIEW ─────────────────────────────────────────────── */}
          {view === "list" && (
            <div className="max-h-[340px] overflow-y-auto">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-semibold text-sm">
                    {filter === "completed"
                      ? "No completed tasks yet"
                      : filter === "active"
                      ? "All caught up!"
                      : "No tasks yet"}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 max-w-[220px]">
                    {filter === "all"
                      ? "Type above and hit Enter to add your first task"
                      : "Switch filters to see other tasks"}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {sortedDateKeys.map((dateKey) => (
                    <div key={dateKey} className="mb-1">
                      {/* Day header */}
                      <div className="flex items-center gap-3 px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                          {formatDateLabel(dateKey)}
                        </span>
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400 tabular-nums font-medium">
                          {tasksByDate[dateKey].length}
                        </span>
                      </div>

                      {/* Tasks */}
                      {tasksByDate[dateKey].map((task) => (
                        <div
                          key={task.id}
                          className={`group flex items-center gap-3 mx-1 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-100 ${
                            task.completed ? "opacity-40" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                              task.completed
                                ? "bg-gray-900 border-gray-900"
                                : "border-gray-300 hover:border-gray-900"
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Left accent bar */}
                          <div className={`w-0.5 h-5 rounded-full ${task.completed ? "bg-gray-200" : "bg-gray-900"}`} />

                          {/* Text */}
                          <span className={`flex-1 text-[13px] transition-all duration-200 ${
                            task.completed ? "line-through text-gray-400" : "text-gray-800"
                          }`}>
                            {task.text}
                          </span>

                          {/* Time */}
                          <span className="text-[10px] text-gray-400 hidden sm:block tabular-nums">
                            {getTimeAgo(task.createdAt)}
                          </span>

                          {/* Delete */}
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 text-xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CALENDAR VIEW ─────────────────────────────────────────── */}
          {view === "calendar" && (
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-sm font-bold text-gray-800 tracking-wide">
                  {MONTHS[calMonth]} {calYear}
                </h3>
                <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1.5 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] text-gray-400 font-semibold py-1 uppercase">
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const dayKey = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dayKey === todayKey;
                  const isSelected = dayKey === selectedDate;
                  const counts = taskCountByDay[day];
                  const hasTasks = !!counts;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-150 text-xs font-medium ${
                        isSelected
                          ? "bg-gray-900 text-white shadow-md scale-105"
                          : isToday
                          ? "bg-gray-100 text-gray-900 ring-1 ring-gray-300 font-bold"
                          : hasTasks
                          ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
                          : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }`}
                    >
                      <span>{day}</span>
                      {hasTasks && (
                        <div className="flex gap-0.5 mt-0.5">
                          {counts.active > 0 && (
                            <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/80" : "bg-gray-900"}`} />
                          )}
                          {counts.completed > 0 && (
                            <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white/50" : "bg-gray-400"}`} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected date detail */}
              {selectedDate && (
                <div className="mt-4">
                  <div className="h-px bg-gray-100 mb-3" />
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-900" />
                    <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                      {formatDateLabel(selectedDate)}
                    </h4>
                    <div className="flex-1" />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {selectedDateTasks.length} {selectedDateTasks.length === 1 ? "task" : "tasks"}
                    </span>
                  </div>

                  {selectedDateTasks.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-gray-400 text-xs">No tasks on this day</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {selectedDateTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
                            task.completed ? "opacity-40" : ""
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                              task.completed
                                ? "bg-gray-900 border-gray-900"
                                : "border-gray-300 hover:border-gray-900"
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className={`flex-1 text-xs ${task.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                            {task.text}
                          </span>
                          <span className="text-[10px] text-gray-400 tabular-nums">
                            {new Date(task.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-900 transition-all duration-200 text-xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Footer ────────────────────────────────────────────────── */}
          {tasks.length > 0 && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[11px] text-gray-400 tabular-nums shrink-0 font-medium">
                  {completedCount}/{tasks.length}
                </span>
                {completedCount > 0 && (
                  <button
                    onClick={() => setTasks((prev) => prev.filter((t) => !t.completed))}
                    className="text-[11px] text-gray-400 hover:text-gray-900 transition shrink-0 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root: Auth Gate ─────────────────────────────────────────────────────────

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <TodoApp
      userEmail={session.user.email ?? ""}
      onLogout={async () => { await supabase.auth.signOut(); }}
    />
  );
}
