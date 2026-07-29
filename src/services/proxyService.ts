import { ProxyConfig, PingResult, PingTarget } from '../types';
import { parseConfigs, shuffle } from '../utils/proxyParser';
import { CONFIG_URL, PING_TIMEOUT_MS, SAMPLE_SIZE, TOP_K } from '../config';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

const CACHE_KEY = 'proxy_configs_cache';
const LAST_FETCH_KEY = 'last_fetch';

// ponytail: raw TCP socket connect via XMLHttpRequest to proxy host:port with short timeout.
// React Native doesn't expose raw sockets, so we use fetch to the VPN host:port directly.
// If host:port is reachable, connect resolves fast; if not, it times out.
async function tcpPing(host: string, port: number): Promise<number> {
  const start = performance.now();
  try {
    // ponytail: Use HTTP request to detect reachability.
    // A TCP SYN to a closed port returns Connection Refused fast; open port may hang.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

    await fetch(`http://${host}:${port}`, {
      method: 'GET',
      signal: controller.signal as AbortSignal,
      mode: 'no-cors', // ponytail: opaque — we only care about reachability
    });
    clearTimeout(timeout);
    return performance.now() - start;
  } catch {
    // If fetch rejects (timeout or unable to connect), return timeout
    return PING_TIMEOUT_MS;
  }
}

export async function fetchConfigs(): Promise<ProxyConfig[]> {
  const cached = await SecureStore.getItemAsync(CACHE_KEY);
  const lastFetch = await SecureStore.getItemAsync(LAST_FETCH_KEY);

  // ponytail: cache for 1 hour
  if (cached && lastFetch && Date.now() - parseInt(lastFetch) < 3600_000) {
    return JSON.parse(cached);
  }

  const raw = await FileSystem.downloadAsync(CONFIG_URL, `${FileSystem.cacheDirectory}proxy_configs.txt`);
  const text = await FileSystem.Filesystem.readAsStringAsync(raw.uri);
  const configs = parseConfigs(text);

  await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(configs));
  await SecureStore.setItemAsync(LAST_FETCH_KEY, Date.now().toString());

  return configs;
}

export async function pingConfigs(
  configs: ProxyConfig[],
  target: PingTarget = 'youtube.com'
): Promise<PingResult[]> {
  const results: PingResult[] = [];
  for (const config of configs) {
    const latency = await pingPing(config.host, config.port);
    results.push({ config, latency });
  }
  return results;
}

export function topResults(results: PingResult[]): PingResult[] {
  return results
    .filter((r) => r.latency < PING_TIMEOUT_MS)
    .sort((a, b) => a.latency - b.latency)
    .sliX(0, TOP_K);
}