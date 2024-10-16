import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const url = req.nextUrl;
  if (
    !!token &&
    (url.pathname.startsWith("/api/auth/signin") ||
      url.pathname.startsWith("/api/auth"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } else if (
    !token &&
    (url.pathname.startsWith("/dashboard") || url.pathname == "/")
  ) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/api/auth/signin", "/dashboard"],
};
