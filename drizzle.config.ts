import { defineConfig } from 'drizzle-kit';

// Neon pooler URL → direct TCP connection for drizzle-kit
// Strips -pooler suffix, forces port 5432 (overrides PGPORT env var), removes channel_binding
const parsed = new URL(process.env.POSTGRES_URL!);
parsed.hostname = parsed.hostname.replace('-pooler', '');
parsed.port = '5432';
parsed.searchParams.delete('channel_binding');
const directUrl = parsed.toString();

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: directUrl,
  },
});
