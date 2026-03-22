import { api } from "./api";
import type { CreatorDashboard, CreatorSubmission, UploadCreatorGameResponse } from "./creator.types";

export async function fetchCreatorDashboard() {
  const response = await api.get<CreatorDashboard>("/creator/dashboard");
  return response.data;
}

export async function uploadCreatorGame(input: {
  title: string;
  description: string;
  category: string;
  version: string;
  thumbnail: File;
  banner?: File | null;
  zipFile: File;
}) {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("category", input.category);
  formData.append("version", input.version);
  formData.append("thumbnail", input.thumbnail);
  if (input.banner) {
    formData.append("banner", input.banner);
  }
  formData.append("zipFile", input.zipFile);

  const response = await api.post<UploadCreatorGameResponse>("/creator/games/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function fetchCreatorSubmissions() {
  const response = await api.get<{ submissions: CreatorSubmission[] }>("/creator/submissions");
  return response.data.submissions;
}

export async function fetchCreatorSubmission(submissionId: string) {
  const response = await api.get<{ submission: CreatorSubmission }>(`/creator/submissions/${submissionId}`);
  return response.data.submission;
}

export async function submitCreatorSubmission(submissionId: string) {
  const response = await api.post<{ submission: CreatorSubmission }>("/creator/games/submit", {
    submissionId,
  });

  return response.data.submission;
}

export async function deleteCreatorSubmission(submissionId: string) {
  const response = await api.delete<{ success: boolean }>(`/creator/submissions/${submissionId}`);
  return response.data;
}


