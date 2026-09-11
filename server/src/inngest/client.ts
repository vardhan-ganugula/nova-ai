import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "nova-ai-studio",
  name: "Nova AI Studio",
  isDev: process.env.NODE_ENV !== "production" || process.env.INNGEST_DEV === "1",
});
