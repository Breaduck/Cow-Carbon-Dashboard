export async function onRequest(context: any) {
  const response = await context.next();
  const url = new URL(context.request.url);

  // Set correct MIME types for assets
  if (url.pathname.endsWith('.js')) {
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
  } else if (url.pathname.endsWith('.mjs')) {
    response.headers.set('Content-Type', 'application/javascript; charset=utf-8');
  } else if (url.pathname.endsWith('.css')) {
    response.headers.set('Content-Type', 'text/css; charset=utf-8');
  }

  return response;
}
