import * as zod from 'zod';

export const endpointPattern = /^[A-Za-z0-9.\_\-\/]+$/;

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
  key: number;
  address: string;
  port: string;
  useragent: string;
  method: string;
  path: string;
  headers: Record<string, string[]>;
  body: Uint8Array;
  cookies: HttpCookie[];
  contentlength: number;
  protocol: string;
  form: Record<string, string>;
  postform: Record<string, string>;
  report: Report;
  timestamp: string;
  uniqueid: string;
}

export const pageSchema = zod.object({
  endpoint: zod.string()
      .trim()
      .min(1, "L'endpoint è obbligatorio")
      .min(2, "L'endpoint deve avere almeno 2 caratteri")
      .max(99, "L'endpoint deve avere meno di 100 caratteri")
    .refine((val) => endpointPattern.test(val), {
        message: "L'endpoint può contenere solo lettere, numeri, trattini (-), underscore (_) e slash (/)",
      }),
  body: zod.string().optional(),
});

export type PageData = zod.infer<typeof pageSchema>;
