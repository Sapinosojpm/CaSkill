import { useEffect, useMemo, useState, useTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createCheckoutSession, fetchPointPackages, fetchPointTransactions, fetchWalletSummary } from "../../api/store.api";
import type { PointPackage, PointTransaction } from "../../api/store.types";
import { PageHero } from "../../components/ui/PageHero";
import { SectionCard } from "../../components/ui/SectionCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/errors";

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(priceCents / 100);
}

function formatTransactionDelta(delta: number) {
  return `${delta > 0 ? "+" : ""}${delta} points`;
}

export function StorePage() {
  const { user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState<PointPackage[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [pointsBalance, setPointsBalance] = useState(user?.pointsBalance ?? 0);
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [activePackageId, setActivePackageId] = useState("");
  const [isPending, startTransition] = useTransition();

  const checkoutState = searchParams.get("checkout");

  useEffect(() => {
    async function loadPackages() {
      try {
        const response = await fetchPointPackages();
        setPackages(response.packages);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load point packages"));
      }
    }

    void loadPackages();
  }, []);

  useEffect(() => {
    async function loadWalletData() {
      try {
        const [walletResponse, transactionResponse] = await Promise.all([
          fetchWalletSummary(),
          fetchPointTransactions(),
        ]);
        setPointsBalance(walletResponse.wallet.pointsBalance);
        setTransactions(transactionResponse.transactions);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Unable to load wallet details"));
      }
    }

    void loadWalletData();
  }, []);

  useEffect(() => {
    if (checkoutState !== "success" && checkoutState !== "cancel") {
      return;
    }

    if (checkoutState === "cancel") {
      setStatusMessage("Checkout was canceled. Your points balance has not changed.");
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          await refreshUser();
          const [walletResponse, transactionResponse] = await Promise.all([
            fetchWalletSummary(),
            fetchPointTransactions(),
          ]);
          setPointsBalance(walletResponse.wallet.pointsBalance);
          setTransactions(transactionResponse.transactions);
          setStatusMessage("Purchase complete. Your points balance has been refreshed.");
        } catch (requestError) {
          setError(getApiErrorMessage(requestError, "Purchase succeeded, but wallet refresh failed"));
        }
      })();
    });
  }, [checkoutState, refreshUser]);

  const packageHighlight = useMemo(
    () => packages.reduce((best, item) => (item.pointsAmount > (best?.pointsAmount ?? 0) ? item : best), null as PointPackage | null),
    [packages],
  );

  async function handleCheckout(pointPackageId: string) {
    setError("");
    setActivePackageId(pointPackageId);

    try {
      const response = await createCheckoutSession(pointPackageId);
      window.location.href = response.checkoutUrl;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to start Stripe checkout"));
      setActivePackageId("");
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Point Store"
        title="Top up your points"
        description="Buy points through Stripe, track your wallet balance, and keep enough credit ready for match entry."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label={`${pointsBalance} points available`} tone="success" />
            <Link
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              to="/games"
            >
              Back to Catalog
            </Link>
          </div>
        }
      />

      {statusMessage ? (
        <SectionCard title="Store status" description="Recent checkout update.">
          <p className="text-sm text-[var(--color-success)]">{statusMessage}</p>
        </SectionCard>
      ) : null}

      {error ? (
        <SectionCard title="Store issue" description="One or more store requests failed.">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </SectionCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <SectionCard title="Packages" description="Choose a point bundle and continue to hosted Stripe checkout.">
          <div className="grid gap-4 md:grid-cols-3">
            {packages.map((item) => {
              const isFeatured = packageHighlight?.id === item.id;
              const isLoading = activePackageId === item.id;

              return (
                <div
                  key={item.id}
                  className={[
                    "rounded-[28px] border p-5 transition",
                    isFeatured
                      ? "border-[rgba(232,255,71,0.35)] bg-[linear-gradient(180deg,rgba(232,255,71,0.10),rgba(17,17,16,0.96))]"
                      : "border-[var(--color-border)] bg-[var(--color-surface-strong)]",
                  ].join(" ")}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-black text-[var(--color-text)]">{item.name}</h3>
                      {isFeatured ? <StatusBadge label="Best value" tone="primary" /> : null}
                    </div>
                    <p className="text-4xl font-black text-[var(--color-success)]">{item.pointsAmount}</p>
                    <p className="text-sm text-[var(--color-muted)]">{item.description ?? "Instantly added to your CaSkill wallet after Stripe confirms payment."}</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{formatPrice(item.priceCents, item.currency)}</p>
                    <button
                      className="inline-flex rounded-full border border-[rgba(232,255,71,0.45)] bg-[var(--color-primary)] px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={Boolean(activePackageId) || isPending}
                      onClick={() => void handleCheckout(item.id)}
                      type="button"
                    >
                      {isLoading ? "Redirecting..." : "Buy with Stripe"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Wallet" description="Your current usable point balance.">
            <div className="space-y-3">
              <p className="text-4xl font-black text-[var(--color-success)]">{pointsBalance}</p>
              <p className="text-sm text-[var(--color-muted)]">
                Use these points for match entry, practice, and future stake-locked gameplay.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Recent purchases" description="Latest ledger activity on this account.">
            <div className="space-y-3">
              {transactions.length ? (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[var(--color-text)]">{transaction.description}</p>
                      <StatusBadge
                        label={formatTransactionDelta(transaction.delta)}
                        tone={transaction.delta >= 0 ? "success" : "warning"}
                      />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                      {new Date(transaction.createdAt).toLocaleString()} • balance after {transaction.balanceAfter}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--color-muted)]">No point transactions yet. Your Stripe purchases will show up here.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
