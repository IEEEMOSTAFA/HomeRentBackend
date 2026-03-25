import type { Request, Response, NextFunction } from "express";
import { auth } from "./auth";
// import { auth } from "./auth";

export async function betterAuthHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    console.log("🔵 BetterAuth Handler:", req.method, req.originalUrl);
    console.log("🔵 Request body:", req.body);

    // Construct full URL
    const protocol = req.protocol;
    const host = req.get("host") || "localhost:5000";
    const url = `${protocol}://${host}${req.originalUrl}`;

    console.log("🔵 Full URL:", url);

    // Prepare headers
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    });

    // Prepare body - FIX: Use null instead of undefined
    const requestBody =
      req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : null;

    // Create Web Request - FIX: Explicitly type the body
    const webRequest = new Request(url, {
      method: req.method,
      headers: headers,
      body: requestBody,
    });

    console.log("🔵 Calling auth.handler...");

    // Call BetterAuth
    const webResponse = await auth.handler(webRequest);

    console.log("🟢 Response status:", webResponse.status);

    // Set status
    res.status(webResponse.status);

    // Set headers
    webResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Get body
    const responseText = await webResponse.text();
    console.log("🟢 Response body:", responseText.substring(0, 200));

    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      return res.json(jsonResponse);
    } catch {
      return res.send(responseText);
    }
  } catch (error) {
    console.error("🔴 BetterAuth error:", error);
    next(error);
  }
}