import "server-only";

import { resend } from "@/app/lib/resend";
import type { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";

export async function handleMercadoPagoPayment(paymentData: PaymentResponse) {
  const metadata = paymentData.metadata;
  const userEmail = metadata?.user_email;
  const testId = metadata?.test_id;

  console.log("PAGAMENTO COM SUCESSO", { userEmail, testId });

  const { data, error } = await resend.emails.send({
    from: 'Acme <me@example.com>',
    to: [userEmail],
    subject: 'Pagamento realizado com sucesso',
    text: 'Pagamento realizado com sucesso'
  })

  if (error) {
    console.error(error);
  }

  console.log(data)
}

