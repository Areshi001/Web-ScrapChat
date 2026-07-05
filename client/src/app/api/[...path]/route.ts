export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const pathStr = path.join('/');
  
  const backendBase = process.env.INTERNAL_API_URL || 'http://127.0.0.1:8000';
  const base = backendBase.startsWith('http') ? backendBase : `http://${backendBase}`;

  const { search } = new URL(request.url);
  const targetUrl = `${base}/${pathStr}${search}`;

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(targetUrl, {
      headers: { 'Accept': 'text/event-stream', 'Cache-Control': 'no-cache' },
      // @ts-ignore - Node 18 fetch supports this
      duplex: 'half',
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to connect to backend', details: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
