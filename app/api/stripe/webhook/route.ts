import stripe from "@/app/lib/stripe";
import { handleStripePayment } from "@/app/server/stripe/handle-payment";
import { handleStripeSubscription } from "@/app/server/stripe/handle-subscription";
import { handleStripeSubscriptionCancellation } from "@/app/server/stripe/handle-subscription-cancellation";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");
  
    if (!signature || !secret) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }
  
    const event = stripe.webhooks.constructEvent(body, signature, secret);
    
    switch (event.type) {
      case "checkout.session.completed":
        const metadata = event.data.object.metadata;
  
        if (metadata?.price === process.env.STRIPE_PRODUCT_PRICE_ID) {
          await handleStripePayment(event);
        }
  
        if (metadata?.price === process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
          await handleStripeSubscription(event);
        }
  
        break;
      case "checkout.session.expired":
        console.log("Send email to user that the payment expired");
        break;
      case "checkout.session.async_payment_succeeded":
        console.log("Send email to user that the payment succeeded");
        break;
      case "checkout.session.async_payment_failed":
        console.log("Send email to user that the payment failed");
        break;
      case "customer.subscription.created":
        console.log("Send email to welcome user");
        break;
      case "customer.subscription.deleted":
        await handleStripeSubscriptionCancellation(event);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ message: "Webhook received" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}