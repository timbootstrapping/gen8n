import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook payload:", body);

    const res = await fetch(
      "https://n8n.ximus.io/webhook-test/n8n-developer-trigger",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const text = await res.text();
    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("Workflow Trigger Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
