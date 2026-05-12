import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Extract country from Vercel's Edge headers or fallback to 'FR'
    const country = request.headers.get("x-vercel-ip-country") || "FR";
    const response = NextResponse.next();

    // Store user's country in a secure cookie
    response.cookies.set('user-country', country, { 
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    // ─── Security Headers (OWASP Best Practices) ────────────────────────
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()"
    );
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            "connect-src 'self' https://*.supabase.co https://api.stepfun.com https://generativelanguage.googleapis.com https://*.firebaseio.com https://*.googleapis.com",
            "frame-ancestors 'none'",
        ].join("; ")
    );

    // ─── API Rate Limit Headers ──────────────────────────────────────────
    if (request.nextUrl.pathname.startsWith("/api/")) {
        response.headers.set("X-Powered-By", "Odyssey.ai Engine");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
