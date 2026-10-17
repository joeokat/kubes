export const FORUM_CATEGORIES = [
  "General",
  "Saving",
  "Investing Basics",
  "Ghana Market",
] as const;

export type ForumCategory =
  | "General"
  | "Saving"
  | "Investing Basics"
  | "Ghana Market";

export interface ForumThread {
  id: string;
  user_id: string;
  title: string;
  category: ForumCategory;
  created_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  user_id: string;
  body: string;
  created_at: string;
  report_count: number;
}

export type ForumReportTarget =
  | { type: "thread"; id: string }
  | { type: "reply"; id: string };
