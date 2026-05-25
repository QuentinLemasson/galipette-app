import type { OpenAPIHono } from "@hono/zod-openapi";

import { auth } from "../../lib/auth.js";

export function registerAuthRoutes(app: OpenAPIHono) {
  app.on(["POST", "GET"], "/api/auth/*", async (c) => {
    const req = c.req.raw;
    // #region agent log
    console.log("[debug-25d030] auth-request", JSON.stringify({url:req.url,protocol:new URL(req.url).protocol,xForwardedProto:req.headers.get('x-forwarded-proto'),host:req.headers.get('host'),hasCookieHeader:Boolean(req.headers.get('cookie')),cookieNames:req.headers.get('cookie')?.split(';').map((s:string)=>s.trim().split('=')[0]).filter(Boolean)??[]}));
    // #endregion
    const response = await auth.handler(req);
    // #region agent log
    const setCookies = response.headers.getSetCookie?.() ?? [];
    console.log("[debug-25d030] auth-response", JSON.stringify({status:response.status,path:new URL(req.url).pathname,setCookieCount:setCookies.length,setCookieHeaders:setCookies,locationHeader:response.headers.get('location')}));
    // #endregion
    return response;
  });
}
