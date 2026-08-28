// Protege /admin.html con HTTP Basic Auth verificada en el servidor
// (Vercel Edge Middleware). El usuario/contraseña viven en variables
// de entorno del proyecto en Vercel, nunca en el código fuente.

export const config = {
  matcher: "/admin.html",
};

export default function middleware(request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    const [user, pass] = atob(authHeader.slice(6)).split(":");
    if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASSWORD) {
      return; // credenciales correctas: se sirve admin.html normalmente
    }
  }

  return new Response("Autenticación requerida.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Panel de administración"' },
  });
}
