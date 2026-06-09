import { Platform, NativeModules } from 'react-native';

// URL da API do Ramon — centralizada para funcionar em:
//  • Device físico via Expo Go (QR Code) → precisa do IP da LAN
//  • Emulador Android → 10.0.2.2 mapeia o host
//  • Simulador iOS / Expo Web → localhost
//
// Em dev no celular físico (QR Code), defina no arquivo .env:
//   EXPO_PUBLIC_API_URL=http://<IP-DO-SEU-PC-NA-LAN>:8000
// Sem isso, tentamos descobrir o IP do Metro/Expo automaticamente.

const ENV_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

function resolveDevHost(): string {
  // O Metro/Expo expoe o IP do host via scriptURL — usamos para apontar a API.
  // Ex.: scriptURL = "http://192.168.0.42:8081/index.bundle?..." → IP = 192.168.0.42
  const scriptURL =
    (NativeModules as { SourceCode?: { scriptURL?: string } }).SourceCode?.scriptURL || '';

  const match = scriptURL.match(/https?:\/\/([^\/:]+)(?::\d+)?/);
  const host = match ? match[1] : '';

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:8000`;
  }
  if (Platform.OS === 'android') return 'http://10.0.2.2:8000';
  return 'http://localhost:8000';
}

export const API_URL: string = ENV_URL || resolveDevHost();

export const ENDPOINTS = {
  login: '/auth/login',
  publicArticles: '/public/articles',
  tags: '/tags',
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>
): string {
  const query: string[] = [];
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    });
  }
  const qs = query.length ? `?${query.join('&')}` : '';
  return `${API_URL}${path}${qs}`;
}
