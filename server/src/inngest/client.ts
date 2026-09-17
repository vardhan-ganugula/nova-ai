import { Inngest } from "inngest";

// Ensure dev mode is never forced on Vercel or in production
const isDev =
  !process.env.VERCEL &&
  process.env.NODE_ENV !== "production" &&
  process.env.INNGEST_DEV === "1";

export const inngest = new Inngest({
  id: "nova-ai-studio",
  name: "Nova AI Studio",
  isDev,
});

