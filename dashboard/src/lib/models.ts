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
