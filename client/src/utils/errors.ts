import { AxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }

  return fallback;
}


