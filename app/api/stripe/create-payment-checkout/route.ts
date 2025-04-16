import { auth } from "@/app/lib/auth";
import stripe from "@/app/lib/stripe";
import { getOrCreateCustomer } from "@/app/server/stripe/get-or-create-customer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { testId } = await request.json();

  const price = process.env.STRIPE_PRODUCT_PRICE_ID;

  if (!price) {
    return NextResponse.json({ error: "Price not found" }, { status: 500 });
  }

  const session = await auth();

  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const customerId = await getOrCreateCustomer(userId, userEmail);

  const metadata = {
    testId,
    price,
    userId
  };

  try {
    const origin = request.headers.get("origin");

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity: 1 }],
      mode: "payment",
      payment_method_types: ["card", "boleto"],
      success_url: `${origin}/success`,
      cancel_url: `${origin}/`,
      ...(userEmail && {
        customer_email: userEmail,
      }),
      customer: customerId,
      metadata,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Session URL not found" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}