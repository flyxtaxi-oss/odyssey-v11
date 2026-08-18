import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Pays du visiteur. Cloudflare est en amont de Vercel : quand il proxyfie,
    // c'est lui qui porte l'info (CF-IPCountry) et l'en-tête Vercel peut
    // manquer. On lit les deux, Cloudflare d'abord.
    const country =
        request.headers.get("cf-ipcountry") ||
        request.headers.get("x-vercel-ip-country") ||
        "FR";
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
    // microphone=(self) : J.A.R.V.I.S. propose une entrée vocale — la bloquer
    // ici rendait la feature silencieusement inopérante. Le reste reste fermé.
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(self), geolocation=(), payment=()"
    );
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            // 'unsafe-eval' n'est requis que par le tooling de dev (HMR,
            // react-refresh). Le bundle Next.js de production n'en a pas
            // besoin — le laisser affaiblissait la protection XSS pour rien.
            process.env.NODE_ENV === "production"
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https:",
            // No Supabase entry: the backend is Firebase. The old
            // https://*.supabase.co origin was a leftover from an abandoned
            // migration and widened the CSP for nothing.
            "connect-src 'self' https://api.stepfun.com https://generativelanguage.googleapis.com https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
            "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
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
