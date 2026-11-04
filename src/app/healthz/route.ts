// Render health check: answers without touching the backend, so a sleeping API cannot fail the deploy.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true, service: "homestaytayninh-frontend", timestamp: new Date().toISOString() });
}
