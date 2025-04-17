import { mpClient } from "@/app/lib/mercadopago";
import { Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const paymentId = searchParams.get("payment_id");
  const testId = searchParams.get("external_reference");

  if (!paymentId || !testId) {
    return NextResponse.json({ error: "Payment ID or external reference not found" }, { status: 400 });
  }

  const payment = new Payment(mpClient);

  const paymentData = await payment.get({
    id: paymentId,
  });

  if (paymentData.status === "approved" || paymentData.date_approved !== null) {
    return NextResponse.redirect(new URL(`/success`, request.url));
  }

  return NextResponse.redirect(new URL(`/`, request.url));
}

