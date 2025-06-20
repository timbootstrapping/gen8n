// app/api/trigger-workflow/route.ts

// Server-side route that forwards workflow data to the public n8n webhook, removing CORS issues for the client.

export async function POST(req: Request) {
  try {
    // Parse the JSON payload coming from the frontend
    const body = await req.json();

    // Forward the payload to the n8n webhook
    const res = await fetch(
      "https://n8n.ximus.io/webhook-test/n8n-developer-trigger",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    // Relay the response from n8n back to the caller
    const text = await res.text();
    return new Response(text, { status: res.status });
  } catch (err) {
    console.error("Workflow Trigger Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
} 