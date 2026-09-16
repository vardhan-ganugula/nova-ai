import type { SerializedError } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import toast from 'react-hot-toast';
import { setModels } from '@/store/modelsSlice.ts';


const API_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000') + '/api';

const apiSlice = createApi({

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
  }),

  reducerPath: 'api',
  tagTypes: ['User', 'History', 'Gallery', 'Collection'],

  endpoints: (builder) => ({

    getUser: builder.query<{ user: any; models?: any }, void>({
      query: () => ({
        url: '/auth/user',
        method: 'GET',
      }),
      providesTags: ['User'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data?.models) {
            dispatch(setModels(data.models));
          }
        } catch {}
      },
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data?.models) {
            dispatch(setModels(data.models));
          }
          const backendMessage = data?.message || data?.msg;
          if (backendMessage) {
            toast.success(backendMessage);
          }
        } catch (err: any) {
          const errData = err?.error?.data;
          const backendMessage =
            typeof errData === 'string'
              ? errData
              : errData?.message || errData?.error;
          if (backendMessage) {
            toast.error(backendMessage);
          }
        }
      },
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const backendMessage = data?.message || data?.msg;
          if (backendMessage) {
            toast.success(backendMessage);
          }
        } catch (err: any) {
          const errData = err?.error?.data;
          const backendMessage =
            typeof errData === 'string'
              ? errData
              : errData?.message || errData?.error;
          if (backendMessage) {
            toast.error(backendMessage);
          }
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
      onQueryStarted: async (_, { queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const backendMessage = data?.message || data?.msg;
          if (backendMessage) {
            toast.success(backendMessage);
          }
        } catch (err: any) {
          const errData = err?.error?.data;
          const backendMessage =
            typeof errData === 'string'
              ? errData
              : errData?.message || errData?.error;
          if (backendMessage) {
            toast.error(backendMessage);
          }
        }
      },
    }),

    generateImage: builder.mutation<
      { message: string; url: string; image?: any; creditsRemaining: number; tokensDeducted: number },
      { prompt: string; style?: string; aspectRatio?: string; model?: string; negativePrompt?: string }
    >({
      query: (body) => ({
        url: '/ai/generate-image',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'History', 'Gallery', 'Collection'],
    }),

    generateVideo: builder.mutation<{ message: string; url: string; creditsRemaining: number; tokensDeducted: number }, { prompt: string }>({
      query: (body) => ({
        url: '/ai/generate-video',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    generateText: builder.mutation<{ text: string; creditsRemaining: number; tokensDeducted: number }, { prompt: string; model?: string }>({
      query: (body) => ({
        url: '/ai/generate-text',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    upscaleImage: builder.mutation<{ message: string; url: string; creditsRemaining: number; tokensDeducted: number }, { imageUrl: string; prompt?: string }>({
      query: (body) => ({
        url: '/ai/upscale-image',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'History', 'Collection'],
    }),

    removeBackground: builder.mutation<{ message: string; url: string; creditsRemaining: number; tokensDeducted: number }, { imageUrl: string; prompt?: string }>({
      query: (body) => ({
        url: '/ai/remove-bg',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'History', 'Collection'],
    }),

    getUserHistory: builder.query<{ images?: any[]; history?: any[] }, void>({
      query: () => ({
        url: '/ai/user-history',
        method: 'GET',
      }),
      providesTags: ['History'],
    }),

    getUserCollections: builder.query<{ collections: any[] }, void>({
      query: () => ({
        url: '/ai/user-collections',
        method: 'GET',
      }),
      providesTags: ['Collection'],
    }),

    getPublicGallery: builder.query<{ images: any[] }, void>({
      query: () => ({
        url: '/ai/public-gallery',
        method: 'GET',
      }),
      providesTags: ['Gallery'],
    }),

    toggleVisibility: builder.mutation<{ message: string; isPublic: boolean; image: any }, { id: string }>({
      query: ({ id }) => ({
        url: `/ai/images/${id}/toggle-visibility`,
        method: 'PATCH',
      }),
      invalidatesTags: ['History', 'Gallery', 'Collection'],
    }),

    toggleLike: builder.mutation<{ liked: boolean; likesCount: number }, { id: string }>({
      query: ({ id }) => ({
        url: `/ai/images/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: ['Gallery'],
    }),

    downloadCleanImage: builder.mutation<{
      message: string;
      downloadUrl: string;
      isOwner: boolean;
      tokensDeducted: number;
      creditsRemaining: number;
    }, { id: string }>({
      query: ({ id }) => ({
        url: `/ai/images/${id}/download-clean`,
        method: 'POST',
      }),
      invalidatesTags: ['User', 'History', 'Collection'],
    }),

    updateProfile: builder.mutation<{ user: any; message: string }, { displayName?: string; username?: string }>({
      query: (body) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    getTokenUsage: builder.query<{
      credits: number;
      tokenCosts: { image: number; upscale: number; removeBg: number; video: number; text: number };
      history: Array<{ id: string; prompt: string; type: string; r2Url: string; status: string; tokensDeducted: number; createdAt: string }>;
    }, void>({
      query: () => ({
        url: '/ai/token-usage',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    getAvailableModels: builder.query<{
      imageModels: Record<string, any>;
      chatModels: Record<string, any>;
      audioModels: Record<string, any>;
      videoModels: Record<string, any>;
    }, void>({
      query: () => ({
        url: '/ai/models',
        method: 'GET',
      }),
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(setModels(data));
          }
        } catch {}
      },
    }),
  })
});

export const {
  useGetUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGenerateImageMutation,
  useGenerateVideoMutation,
  useGenerateTextMutation,
  useUpscaleImageMutation,
  useRemoveBackgroundMutation,
  useGetUserHistoryQuery,
  useGetUserCollectionsQuery,
  useGetPublicGalleryQuery,
  useToggleVisibilityMutation,
  useToggleLikeMutation,
  useDownloadCleanImageMutation,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetTokenUsageQuery,
  useGetAvailableModelsQuery,
} = apiSlice;
export default apiSlice;