import "server-only";

import { db } from "@/app/lib/firebase";
import { resend } from "@/app/lib/resend";

import type Stripe from "stripe";

export async function handleStripePayment(event: Stripe.CheckoutSessionCompletedEvent) {
  if (event.data.object.payment_status === "paid") {
    const metadata = event.data.object.metadata
    const userEmail = event.data.object.customer_email ?? event.data.object.customer_details?.email;
    const userId = metadata?.userId;
  
    if (!userId || !userEmail) {
      console.error("User ID or email not found");
      return;
    }
    
    await db.collection("users").doc(userId).update({
      stripeSubscriptionId: event.data.object.subscription,
      stripeSubscriptionStatus: "active",
    });

    const { data, error } = await resend.emails.send({
      from: 'Acme <me@ebertoliveira.dev>',
      to: [userEmail],
      subject: 'Payment successful',
      text: 'Payment successful',
    });
    
    if (error) {
      console.error(error);
    }
    
    console.log(data)
  }
}
