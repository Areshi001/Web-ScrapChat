export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathStr = path.join('/');

  const rawUrl = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000';
  const base = rawUrl.startsWith('http') ? rawUrl.replace(/\/$/, '') : `https://${rawUrl}`;

  const { search } = new URL(request.url);
  const targetUrl = `${base}/${pathStr}${search}`;

  console.log(`[proxy] → ${targetUrl}`);

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: { 'Accept': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const text = await upstreamResponse.text().catch(() => '');
      console.error(`[proxy] Backend error ${upstreamResponse.status}: ${text}`);
      return new Response(
        `data: {"type":"content","content":"Backend error ${upstreamResponse.status}. Make sure the backend service is running."}\n\ndata: {"type":"end"}\n\n`,
        { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
      );
    }

    return new Response(upstreamResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error(`[proxy] Fetch failed: ${err}`);
    return new Response(
      `data: {"type":"content","content":"Could not reach the backend at ${base}. It may be starting up — please try again in a moment."}\n\ndata: {"type":"end"}\n\n`,
      { status: 200, headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } }
    );
  }
}
