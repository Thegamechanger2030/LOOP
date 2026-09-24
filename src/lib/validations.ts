// Zod schemas shared by API route handlers — every request body is
// validated against one of these before it touches the database.
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z.string().min(1, "Workspace name is required"),
});

export const createFeedbackSchema = z.object({
  content: z.string().min(1, "Feedback content is required"),
  channel: z.string().min(1, "Channel is required"),
  customerLabel: z.string().optional(),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

export const askSchema = z.object({
  question: z.string().min(3, "Ask a more specific question"),
});

export const generateReportSchema = z.object({
  periodDays: z.number().int().min(1).max(365).default(7),
});

export const inviteMemberSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"]),
});
