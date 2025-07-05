import posthog from 'posthog-js';

if (typeof window !== 'undefined' && !posthog.__loaded) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: '/ph-proxy-8n/',
  });
  (posthog as any).__loaded = true; // Prevent double init
}

export default posthog; 