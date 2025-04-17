import { mpClient } from "@/app/lib/mercadopago";
import { Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const { testId, userEmail } = await request.json();

  try {
    const preference = new Preference(mpClient);
    
    const createdPreference = await preference.create({
      body: {
        external_reference: testId,
        metadata: {
          testId,
        },
        ...(userEmail && {
          payer: {
            email: userEmail,
          }
        }),
        items: [
          {
            id: "1",
            title: "Teste",
            quantity: 1,
            unit_price: 1,
            currency_id: "BRL",
            category_id: "services",
          }
        ],
        payment_methods: {
          installments: 12,
          // excluded_payment_methods: [
          //   {
          //     id: "bolbradesco"
          //   },
          //   {
          //     id: "pec"
          //   }
          // ],
          // excluded_payment_types: [
          //   {
          //     id: "debit_card"
          //   },
          //   {
          //     id: "credit_card"
          //   }
          // ],
        },
        auto_return: "approved",
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercado-pago/pending`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercado-pago/pending`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercado-pago/pending`,
        },
      }
    })

    if (!createdPreference.id) {
      return NextResponse.json({ error: "Erro ao criar checkout com Mercado Pago" }, { status: 500 });
    }

    return NextResponse.json({ initPoint: createdPreference.init_point, preferenceId: createdPreference.id });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }

  return NextResponse.json({ testId });
}