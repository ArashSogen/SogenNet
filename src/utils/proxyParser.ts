import { ProxyConfig } from '../types';

const VLESS_RE = /^vless:\/\/([a-f0-9-]+)@([^:]+):(\d+)\?(.+?)#(.+)$/i;

export function parseVlessUrl(raw: string): ProxyConfig | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return null;

  const match = trimmed.match(VLESS_RE);
  if (!match) return null;

  const [, uuid, host, portStr, params, label] = match;
  const port = parseInt(portStr, 10);
  if (isNaN(port) || port < 1 || port > 65535) return null;

  return { uuid, host, port, params, label: decodeURIComponent(label), raw: trimmed };
}

export function parseConfigs(rawText: string): ProxyConfig[] {
  const lines = rawText.split('\n');
  const configs: ProxyConfig[] = [];
  for (const line of lines) {
    const parsed = parseVlessUrl(line);
    if (parsed) configs.push(parsed);
  }
  return configs;
}

// ponytail: Fisher-Yates in-place, O(n). No lodash.
export function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}