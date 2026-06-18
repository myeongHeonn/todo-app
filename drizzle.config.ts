import { defineConfig } from 'drizzle-kit';

const rawUrl = process.env.POSTGRES_URL!;

// Neon pooler URL인 경우에만 direct connection으로 변환
function toDirectUrl(url: string): string {
  if (!url.includes('neon.tech')) return url;
  const parsed = new URL(url);
  parsed.hostname = parsed.hostname.replace('-pooler', '');
  parsed.port = '5432';
  parsed.searchParams.delete('channel_binding');
  return parsed.toString();
}

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: toDirectUrl(rawUrl),
  },
});
