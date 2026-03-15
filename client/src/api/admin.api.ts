import { api } from "./api";
import type { CreatorSubmission } from "./creator.types";
import type { AdminDashboard, CheatFlagItem } from "./admin.types";

export async function fetchAdminDashboard() {
  const response = await api.get<AdminDashboard>("/admin/dashboard");
  return response.data;
}

export async function fetchAdminSubmissions() {
  const response = await api.get<{ submissions: CreatorSubmission[] }>("/admin/submissions");
  return response.data.submissions;
}

export async function fetchAdminSubmission(submissionId: string) {
  const response = await api.get<{ submission: CreatorSubmission }>(`/admin/submissions/${submissionId}`);
  return response.data.submission;
}

export async function approveAdminSubmission(submissionId: string, notes: string) {
  const response = await api.post<{ submission: CreatorSubmission }>(`/admin/submissions/${submissionId}/approve`, { notes });
  return response.data.submission;
}

export async function rejectAdminSubmission(submissionId: string, notes: string) {
  const response = await api.post<{ submission: CreatorSubmission }>(`/admin/submissions/${submissionId}/reject`, { notes });
  return response.data.submission;
}

export async function fetchCheatFlags() {
  const response = await api.get<{ cheatFlags: CheatFlagItem[] }>("/admin/cheat-flags");
  return response.data.cheatFlags;
}


