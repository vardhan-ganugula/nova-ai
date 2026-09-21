import React from "react";

export interface SocialPlatformConfig {
  id: string;
  name: string;
  category: "visual" | "professional" | "video" | "automation";
  icon: React.ComponentType<{ className?: string }>;
  brandColor: string;
  bgGlow: string;
  borderColor: string;
  description: string;
  supportedFormats: string[];
  permissions: string[];
  defaultHashtags: string[];
  connected: boolean;
  accountId?: string;
  handle?: string;
  displayName?: string;
  avatarUrl?: string;
  followers?: string;
  lastSynced?: string;
  autoPostEnabled?: boolean;
  includeAiDisclaimer: boolean;
  postFormat: string;
  hasToken?: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string | null;
}
