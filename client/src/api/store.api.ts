import { api } from "./api";
import type {
  CheckoutSessionResponse,
  PointPackagesResponse,
  PointTransactionsResponse,
  WalletSummary,
} from "./store.types";

export async function fetchPointPackages() {
  const response = await api.get<PointPackagesResponse>("/store/packages");
  return response.data;
}

export async function fetchWalletSummary() {
  const response = await api.get<WalletSummary>("/store/wallet");
  return response.data;
}

export async function fetchPointTransactions() {
  const response = await api.get<PointTransactionsResponse>("/store/transactions");
  return response.data;
}

export async function createCheckoutSession(pointPackageId: string) {
  const response = await api.post<CheckoutSessionResponse>("/store/checkout-session", { pointPackageId });
  return response.data;
}

