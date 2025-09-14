import * as Sentry from '@sentry/react';

Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [
        Sentry.replayIntegration(),
        Sentry.browserTracingIntegration()
    ],
    tracePropagationTargets: ["localhost",
        /^https:\/\/api\.steampricetracker\.com/,
        /^https:\/\/.*\.supabase\.co/
],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE
});

export default Sentry;

