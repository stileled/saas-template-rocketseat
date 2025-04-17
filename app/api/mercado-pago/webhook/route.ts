import { mpClient } from "@/app/lib/mercadopago";
import { handleMercadoPagoPayment } from "@/app/server/mercado-pago/handle-payment";
import { validateMercadoPagoWebhook } from "@/app/server/mercado-pago/validate-mercadopago-webhook";
import { Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    validateMercadoPagoWebhook(request);
    
    const body = await request.json();
    const { type, data } = body;
    
    switch (type) {
      case "payment":
        const payment = new Payment(mpClient);
        const paymentData = await payment.get({
          id: data.id,
        });
        
        if (paymentData.status === "approved" || paymentData.date_approved !== null) {
          await handleMercadoPagoPayment(paymentData);
        }

        break;
      case "subscription-preapproval":
        break;
      default:
        console.log("Unhandled event type:", type);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to parse request body" }, { status: 400 });
  }
}
