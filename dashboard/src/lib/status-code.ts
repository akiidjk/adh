export function getStatusCodeColor(code: number): string {
  if (code >= 200 && code < 300) return "text-emerald-500";
  if (code >= 300 && code < 400) return "text-blue-400";
  if (code >= 400 && code < 500) return "text-amber-500";
  if (code >= 500) return "text-destructive";
  return "text-muted-foreground";
}

export function getStatusCodeBadgeClass(code: number): string {
  if (code >= 200 && code < 300)
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (code >= 300 && code < 400)
    return "bg-blue-400/10 text-blue-400 border-blue-400/20";
  if (code >= 400 && code < 500)
    return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  if (code >= 500)
    return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-secondary text-muted-foreground border-border";
}

export function getStatusCodeLabel(code: number): string {
  if (code >= 200 && code < 300) return "Success";
  if (code >= 300 && code < 400) return "Redirect";
  if (code >= 400 && code < 500) return "Client err";
  if (code >= 500) return "Server err";
  return "Info";
}

export const COMMON_STATUS_CODES = [
  { code: 200, label: "200 OK" },
  { code: 201, label: "201 Created" },
  { code: 204, label: "204 No Content" },
  { code: 301, label: "301 Moved Permanently" },
  { code: 302, label: "302 Found" },
  { code: 304, label: "304 Not Modified" },
  { code: 400, label: "400 Bad Request" },
  { code: 401, label: "401 Unauthorized" },
  { code: 403, label: "403 Forbidden" },
  { code: 404, label: "404 Not Found" },
  { code: 500, label: "500 Internal Server Error" },
  { code: 503, label: "503 Service Unavailable" },
] as const;
