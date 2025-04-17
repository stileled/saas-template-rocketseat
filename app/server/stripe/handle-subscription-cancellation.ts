import "server-only";

import { db } from "@/app/lib/firebase";
import { resend } from "@/app/lib/resend";
import type Stripe from "stripe";

export async function handleStripeSubscriptionCancellation(event: Stripe.CustomerSubscriptionDeletedEvent) {
  const customerId = event.data.object.customer;

  const userRef = await db.collection("users").where("stripeCustomerId", "==", customerId).get();

  if (userRef.empty) {
    console.error("User not found");
    return;
  }

  const userId = userRef.docs[0].id;
  const userEmail = userRef.docs[0].data().email;

  await db.collection("users").doc(userId).update({
    stripeSubscriptionStatus: "inactive",
  });

  const { data, error } = await resend.emails.send({
    from: 'Acme <me@ebertoliveira.dev>',
    to: [userEmail],
    subject: 'Subscription cancelled',
    text: 'Subscription cancelled',
  });

  if (error) {
    console.error(error);
  }
  
  console.log(data)
}