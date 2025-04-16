"use client";

import { useStripe } from "@/app/hooks/useStripe";

export default function Pagamentos() {
  const { createPaymentStripeCheckout, createSubscriptionStripeCheckout, createStripePortal } = useStripe();

  return (
    <div className="flex flex-col gap-10 items-center justify-center h-screen">
      <h1>Pagamentos</h1>

      <button className="border rounded-md px-1" onClick={() => createPaymentStripeCheckout({ testId: "123" })}>Criar Pagamento Stripe</button>
      <button className="border rounded-md px-1" onClick={() => createSubscriptionStripeCheckout({ testId: "123" })}>Criar Assinatura Stripe</button>
      <button className="border rounded-md px-1" onClick={() => createStripePortal()}>Criar Portal de Pagamentos</button>
    </div>
  );
}
