export interface ProxyConfig {
  uuid: string;
  host: string;
  port: number;
  params: string;
  label: string;
  raw: string;
}

export interface PingResult {
  config: ProxyConfig;
  latency: number;
  error?: string;
}

export type PingTarget = 'youtube.com' | 'github.com' | 'google.com';