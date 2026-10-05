const developmentOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://foodee-fe.onrender.com',
];

export function allowedCorsOrigins(environment = process.env): string[] {
  const isProduction = environment.NODE_ENV === 'production';
  const origins = isProduction ? [] : [...developmentOrigins];
  const configured = [
    ...(environment.ALLOWED_ORIGINS || '').split(','),
    environment.FRONTEND_URL || '',
  ];

  for (const raw of configured) {
    const origin = raw.trim().replace(/\/$/, '');
    if (!origin) continue;
    if (isProduction) {
      let parsed: URL;
      try {
        parsed = new URL(origin);
      } catch {
        throw new Error(`Invalid production CORS origin: ${origin}`);
      }
      if (parsed.protocol !== 'https:' || parsed.origin !== origin) {
        throw new Error(`Production CORS origin must be an HTTPS origin: ${origin}`);
      }
    }
    if (!origins.includes(origin)) origins.push(origin);
  }

  if (isProduction && !origins.length) {
    throw new Error('At least one production CORS origin is required');
  }
  return origins;
}
