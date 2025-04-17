import { db } from "@/app/lib/firebase";
import { resend } from "@/app/lib/resend";
import "server-only";
import type Stripe from "stripe";

export async function handleStripeSubscription(event: Stripe.CheckoutSessionCompletedEvent) {
  if (event.data.object.payment_status === "paid") {
    const metadata = event.data.object.metadata
    const userEmail = event.data.object.customer_email || event.data.object.customer_details?.email;
    const userId = metadata?.userId;

  
    if (!userId || !userEmail) {
      console.error("User ID not found");
      return;
    }
    
    await db.collection("users").doc(userId).update({
      stripeSubscriptionId: event.data.object.subscription,
      stripeSubscriptionStatus: "active",
    });

    
    const { data, error } = await resend.emails.send({
      from: 'Acme <me@ebertoliveira.dev>',
      to: [userEmail],
      subject: 'Subscription successful',
      text: 'Subscription successful',
    });
    
    if (error) {
      console.error(error);
    }
    
    console.log(data)
  }
}