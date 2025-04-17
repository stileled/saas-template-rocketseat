import "server-only";

import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";

export function validateMercadoPagoWebhook(request: NextRequest) {
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    return NextResponse.json({ error: "Missing x-signature or x-request-id header" }, { status: 400 });
  }

  const signatureParts = xSignature.split(",");
  let ts = "";
  let v1 = "";

  signatureParts.forEach((part) => {
    const [key, value] = part.split("=");

    if (key === "ts") ts = value.trim();
    if (key === "v1") v1 = value.trim();
  });

  if (!ts || !v1) {
    return NextResponse.json({ error: "Invalid x-signature header format" }, { status: 400 });
  }

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");

  let manifest = "";

  if (dataId) {
    manifest += `request-id=${dataId}`;
  }

  manifest += `ts=${ts};`;
  
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET!;
  const hmac = createHmac("sha256", secret);
  hmac.update(manifest);
  const generatedHash = hmac.digest("hex");

  if (generatedHash !== v1) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
