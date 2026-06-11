import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️  STRIPE_SECRET_KEY is not set. Stripe will not work.");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.chameleon.2" as any,
    })
  : (null as unknown as Stripe);

export const PRICES = {
  premium_monthly: { price: 399, id: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "premium_monthly" },
  premium_yearly: { price: 299, id: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "premium_yearly" },
  pro_monthly: { price: 799, id: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "pro_monthly" },
  pro_yearly: { price: 599, id: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "pro_yearly" },
} as const;

export const PLAN_LIMITS = {
  free: {
    label: "Gratuit",
    offers_per_day: 5,
    max_cv: 1,
    lettre: true,
    entretien: true,
    traduction: false,
    formations: false,
  },
  premium: {
    label: "Premium",
    offers_per_day: Infinity,
    max_cv: Infinity,
    lettre: true,
    entretien: true,
    traduction: false,
    formations: false,
  },
  pro: {
    label: "Pro",
    offers_per_day: Infinity,
    max_cv: Infinity,
    lettre: true,
    entretien: true,
    traduction: true,
    formations: true,
  },
};

export function getPlanFromPriceId(priceId: string): { plan: "premium" | "pro"; interval: "month" | "year" } | null {
  const map: Record<string, { plan: "premium" | "pro"; interval: "month" | "year" }> = {
    premium_monthly: { plan: "premium", interval: "month" },
    premium_yearly: { plan: "premium", interval: "year" },
    pro_monthly: { plan: "pro", interval: "month" },
    pro_yearly: { plan: "pro", interval: "year" },
  };

  // Also check env-based price IDs
  if (process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID) {
    map[process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID] = { plan: "premium", interval: "month" };
  }
  if (process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID) {
    map[process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID] = { plan: "premium", interval: "year" };
  }
  if (process.env.STRIPE_PRO_MONTHLY_PRICE_ID) {
    map[process.env.STRIPE_PRO_MONTHLY_PRICE_ID] = { plan: "pro", interval: "month" };
  }
  if (process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
    map[process.env.STRIPE_PRO_YEARLY_PRICE_ID] = { plan: "pro", interval: "year" };
  }

  return map[priceId] || null;
}

export default stripe;
