import type { ForumCategory, ForumReply, ForumThread } from "../types/forum";

export const FORUM_CATEGORIES: ForumCategory[] = [
  "General",
  "Saving",
  "Investing Basics",
  "Ghana Market",
];

export function validateForumThread(
  title: string,
  category: string,
): string | null {
  if (title.trim().length < 5 || title.trim().length > 120) {
    return "Thread titles must be between 5 and 120 characters.";
  }
  if (!FORUM_CATEGORIES.includes(category as ForumCategory)) {
    return "Choose a forum category.";
  }
  return null;
}

export function validateForumReply(body: string): string | null {
  if (body.trim().length < 2 || body.trim().length > 5000) {
    return "Replies must be between 2 and 5,000 characters.";
  }
  return null;
}

export function validateForumReportReason(reason: string): string | null {
  if (reason.trim().length < 5 || reason.trim().length > 1000) {
    return "Tell us why you are reporting this (5 to 1,000 characters).";
  }
  return null;
}

export async function fetchForumThreads(
  category?: ForumCategory,
): Promise<{ data: ForumThread[]; error: Error | null }> {
  try {
    const { supabase } = await import("./supabase");
    let request = supabase
      .from("forum_threads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (category) request = request.eq("category", category);
    const { data, error } = await request;
    if (error) return { data: [], error: new Error(error.message) };
    return { data: (data || []) as ForumThread[], error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function fetchForumThread(threadId: string): Promise<{
  thread: ForumThread | null;
  replies: ForumReply[];
  error: Error | null;
}> {
  try {
    const { supabase } = await import("./supabase");
    const { data: thread, error } = await supabase
      .from("forum_threads")
      .select("*")
      .eq("id", threadId)
      .maybeSingle();
    if (error)
      return { thread: null, replies: [], error: new Error(error.message) };
    if (!thread) return { thread: null, replies: [], error: null };

    const { data: replies, error: replyError } = await supabase
      .from("forum_replies")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (replyError) {
      return {
        thread: thread as ForumThread,
        replies: [],
        error: new Error(replyError.message),
      };
    }
    return {
      thread: thread as ForumThread,
      replies: (replies || []) as ForumReply[],
      error: null,
    };
  } catch (error) {
    return {
      thread: null,
      replies: [],
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function createForumThread(input: {
  userId: string;
  title: string;
  category: ForumCategory;
}): Promise<{ data: ForumThread | null; error: Error | null }> {
  const validationError = validateForumThread(input.title, input.category);
  if (validationError) return { data: null, error: new Error(validationError) };
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("forum_threads")
      .insert({
        user_id: input.userId,
        title: input.title.trim(),
        category: input.category,
      })
      .select()
      .single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ForumThread, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function createForumReply(input: {
  userId: string;
  threadId: string;
  body: string;
}): Promise<{ data: ForumReply | null; error: Error | null }> {
  const validationError = validateForumReply(input.body);
  if (validationError) return { data: null, error: new Error(validationError) };
  try {
    const { supabase } = await import("./supabase");
    const { data, error } = await supabase
      .from("forum_replies")
      .insert({
        user_id: input.userId,
        thread_id: input.threadId,
        body: input.body.trim(),
      })
      .select()
      .single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data: data as ForumReply, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function reportForumContent(input: {
  reporterId: string;
  target: { type: "thread" | "reply"; id: string };
  reason: string;
}): Promise<{ error: Error | null }> {
  const validationError = validateForumReportReason(input.reason);
  if (validationError) return { error: new Error(validationError) };
  try {
    const { supabase } = await import("./supabase");
    const report = {
      reporter_id: input.reporterId,
      thread_id: input.target.type === "thread" ? input.target.id : null,
      reply_id: input.target.type === "reply" ? input.target.id : null,
      reason: input.reason.trim(),
    };
    const { error } = await supabase
      .from("forum_reports")
      .insert(report as never);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}
