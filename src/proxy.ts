import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    // console.log("MIDDLE")
    if (pathname.startsWith("/manage")) {
        const session = await getCookieCache(request);
        // console.log(session);
        if (!session) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("redirect", pathname);
            return NextResponse.redirect(loginUrl);
        }

        return NextResponse.next();
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/manage/:path*"],
};
