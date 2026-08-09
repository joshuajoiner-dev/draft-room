import { headers } from "next/headers";

export function getRequestOrigin() {
  const requestHeaders = headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  return `${protocol}://${host}`;
}
