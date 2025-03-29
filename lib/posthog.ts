import { PostHog } from "posthog-node";

const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: "https://eu.i.posthog.com",
});

export const identifyUser = async (
  userId: string,
  properties: Record<string, any> = {}
) => {
  try {
    await posthog.identify({
      distinctId: userId,
      properties: {
        ...properties,
        $set_once: {
          first_seen: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Failed to identify user in PostHog:", error);
  }
};

export const trackServerEvent = async (
  eventName: string,
  properties: Record<string, any> = {},
  userId?: string
) => {
  try {
    await posthog.capture({
      event: eventName,
      distinctId: userId || "anonymous",
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to track PostHog event:", error);
  }
};

export const shutdownPostHog = async () => {
  await posthog.shutdown();
};
