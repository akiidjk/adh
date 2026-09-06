import * as zod from 'zod';

export const endpointPattern = /^[A-Za-z0-9.\_\-\/]+$/;
const reservedEndpoints = new Set(['_', 'healthz']);
const forbiddenHeaders = new Set([
  'connection',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
]);

export interface Report {
  uri: string;
  cookies: string;
  referrer: string;
  user_agent: string;
  origin: string;
  lang: string;
  gpu: string;
  localstorage: Record<string, string>;
  sessionstorage: Record<string, string>;
  dom: string;
  screenshot: string;
}

export interface HttpCookie {
  Name: string;
  Value: string;
  Quoted: boolean;
  Path: string;
  Domain: string;
  Expires: string;
  RawExpires: string;
  MaxAge: number;
  Secure: boolean;
  HttpOnly: boolean;
  SameSite: number;
  Partitioned: boolean;
  Raw: string;
  Unparsed: string[] | null;
}

export interface RequestMessage {
  key: string;
  address: string;
  port: string;
  useragent: string;
  method: string;
  path: string;
  headers: Record<string, string[]>;
  body: string;
  cookies: HttpCookie[];
  contentlength: number;
  protocol: string;
  form: Record<string, string>;
  postform: Record<string, string>;
  report: Report;
  timestamp: string;
}

export const headerEntrySchema = zod.object({
  key: zod
    .string()
    .min(1, 'Header name is required')
    .max(100, 'Header name is too long')
    .regex(/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/, 'Invalid HTTP header name')
    .refine((key) => !forbiddenHeaders.has(key.toLowerCase()), 'This response header is managed by the server'),
  value: zod
    .string()
    .max(8192, 'Header value is too long')
    .refine((value) => !/[\r\n]/.test(value), 'Invalid header value')
});

export type HeaderEntry = zod.infer<typeof headerEntrySchema>;

export const pageSchema = zod.object({
  endpoint: zod
    .string()
    .trim()
    .min(1, "L'endpoint è obbligatorio")
    .min(2, "L'endpoint deve avere almeno 2 caratteri")
    .max(99, "L'endpoint deve avere meno di 100 caratteri")
    .refine((val) => endpointPattern.test(val), {
      message: "L'endpoint può contenere solo lettere, numeri, trattini (-), underscore (_) e slash (/)"
    })
    .refine((val) => !reservedEndpoints.has(val.replace(/^\/+/, '')), {
      message: "L'endpoint è riservato"
    }),
  body: zod
    .string()
    .max(1024 * 1024, 'Body must be 1 MiB or smaller')
    .optional(),
  statusCode: zod
    .number()
    .int('Status code must be an integer')
    .min(100, 'Status code must be between 100 and 599')
    .max(599, 'Status code must be between 100 and 599'),
  headers: zod.array(headerEntrySchema).max(50, 'No more than 50 headers are allowed'),
  originalEndpoint: zod.string().trim().min(2).max(99).regex(endpointPattern).optional()
});

export type PageData = zod.infer<typeof pageSchema>;

export const storedPageSchema = zod.object({
  body: zod
    .string()
    .max(1024 * 1024)
    .optional(),
  statusCode: zod.number().int().min(100).max(599),
  headers: zod.record(zod.string(), zod.string())
});

export type StoredPageData = zod.infer<typeof storedPageSchema>;
