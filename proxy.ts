import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const unauthorizedResponse = () =>
  new NextResponse("Autenticacion requerida.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin ELOTES DE LA FUENTE"',
    },
  });

export function proxy(request: NextRequest) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return new NextResponse(
      "Faltan ADMIN_USERNAME y ADMIN_PASSWORD para proteger /admin.",
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encodedCredentials = authorization.split(" ")[1];

  if (!encodedCredentials) {
    return unauthorizedResponse();
  }

  const decodedCredentials = atob(encodedCredentials);
  const [username, password] = decodedCredentials.split(":");

  if (username !== adminUser || password !== adminPassword) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
