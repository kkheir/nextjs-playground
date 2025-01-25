import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use an environment variable in production
const protectedRoutes = ["/", "/logout"];
const publicRoutes = ["/login", "/register"];

// Function to verify JWT using jose
async function verifyJWT(token, secret) {
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload; // Returns the decoded payload if verification succeeds
  } catch (error) {
    console.error(error);
    return null; // Return null if verification fails
  }
}

export default async function middleware(req) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const token = req.cookies.get("token")?.value;
  const session = token ? await verifyJWT(token, JWT_SECRET) : null;
  console.log(session);

  // Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session?.email) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    session?.email &&
    !req.nextUrl.pathname.startsWith("/")
  ) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
