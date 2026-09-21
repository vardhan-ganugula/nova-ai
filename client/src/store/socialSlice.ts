import apiSlice from "./authSlice.ts";

export interface SocialAccount {
  id: string;
  userId: string;
  platform: string;
  platformAccountId: string;
  accountUsername: string;
  accountName: string;
  avatarUrl?: string | null;
  status: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiresAt?: string | null;
  hasToken?: boolean;
  metadata?: {
    defaultHashtags?: string[];
    includeAiDisclaimer?: boolean;
    autoPostEnabled?: boolean;
    postFormat?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  userId: string;
  imageId?: string | null;
  mediaUrl: string;
  mediaType: "image" | "video" | "audio";
  caption: string;
  targetPlatforms: string[];
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  scheduledFor?: string | null;
  publishedAt?: string | null;
  platformPostIds?: Record<string, string> | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPostsResponse {
  posts: SocialPost[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WorkflowWebhookData {
  id?: string;
  webhookUrl: string;
  secret: string;
  isActive: boolean;
  events: string[];
  lastTriggeredAt?: string | null;
}

export const socialApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSocialAccounts: builder.query<{ accounts: SocialAccount[] }, void>({
      query: () => ({
        url: "/socials/accounts",
        method: "GET",
      }),
      providesTags: ["SocialAccounts"],
    }),

    verifySocialToken: builder.mutation<
      { success: boolean; verified: boolean; message: string; accountDetails?: any; error?: string },
      { platform: string; accessToken: string; accountUsername?: string }
    >({
      query: (data) => ({
        url: "/socials/accounts/verify",
        method: "POST",
        body: data,
      }),
    }),

    connectSocialAccount: builder.mutation<
      { message: string; account: SocialAccount },
      {
        platform: string;
        platformAccountId: string;
        accountUsername: string;
        accountName: string;
        avatarUrl?: string;
        accessToken?: string;
        refreshToken?: string;
        tokenExpiresAt?: string | null;
        metadata?: any;
      }
    >({
      query: (data) => ({
        url: "/socials/accounts/connect",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SocialAccounts"],
    }),

    updateSocialAccount: builder.mutation<
      { message: string; account: SocialAccount },
      {
        id: string;
        accountUsername?: string;
        accountName?: string;
        avatarUrl?: string;
        accessToken?: string;
        refreshToken?: string;
        tokenExpiresAt?: string | null;
        metadata?: any;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/socials/accounts/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SocialAccounts"],
    }),

    unlinkAllSocialAccounts: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/socials/accounts/unlink-all",
        method: "POST",
      }),
      invalidatesTags: ["SocialAccounts"],
    }),

    disconnectSocialAccount: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/socials/accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SocialAccounts"],
    }),

    getSocialPosts: builder.query<
      SocialPostsResponse,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status = "all" } = {}) => ({
        url: `/socials/posts?page=${page}&limit=${limit}&status=${status}`,
        method: "GET",
      }),
      providesTags: ["SocialPosts"],
    }),

    createSocialPost: builder.mutation<
      { message: string; post: SocialPost },
      {
        mediaUrl: string;
        mediaType?: "image" | "video" | "audio";
        caption: string;
        targetPlatforms: string[];
        scheduledFor?: string | null;
        imageId?: string | null;
      }
    >({
      query: (postData) => ({
        url: "/socials/posts",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["SocialPosts"],
    }),

    publishPostNow: builder.mutation<{ message: string; postId: string }, string>({
      query: (id) => ({
        url: `/socials/posts/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: ["SocialPosts"],
    }),

    deleteSocialPost: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/socials/posts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SocialPosts"],
    }),

    getWebhookConfig: builder.query<{ webhook: WorkflowWebhookData | null }, void>({
      query: () => ({
        url: "/socials/webhook",
        method: "GET",
      }),
      providesTags: ["SocialWebhook"],
    }),

    saveWebhookConfig: builder.mutation<
      { message: string; webhook: WorkflowWebhookData },
      {
        webhookUrl: string;
        secret: string;
        isActive: boolean;
        events: string[];
      }
    >({
      query: (data) => ({
        url: "/socials/webhook",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SocialWebhook"],
    }),

    testWebhookConfig: builder.mutation<
      { success: boolean; message: string },
      { webhookUrl: string; secret: string }
    >({
      query: (data) => ({
        url: "/socials/webhook/test",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetSocialAccountsQuery,
  useVerifySocialTokenMutation,
  useConnectSocialAccountMutation,
  useUnlinkAllSocialAccountsMutation,
  useUpdateSocialAccountMutation,
  useDisconnectSocialAccountMutation,
  useGetSocialPostsQuery,
  useCreateSocialPostMutation,
  usePublishPostNowMutation,
  useDeleteSocialPostMutation,
  useGetWebhookConfigQuery,
  useSaveWebhookConfigMutation,
  useTestWebhookConfigMutation,
} = socialApiSlice;
