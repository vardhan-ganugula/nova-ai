import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ModelItem {
  name: string;
  price: number;
  provider: string;
  badge?: string;
  version?: string;
  description: string;
}

export interface ModelsState {
  imageModels: Record<string, ModelItem>;
  chatModels: Record<string, any>;
  audioModels: Record<string, any>;
  videoModels: Record<string, any>;
  selectedImageModel: string;
}

// Fallback initial models in case server hasn't responded yet
const initialImageModels: Record<string, ModelItem> = {
  "Flux Schnell": {
    name: "fal-ai/flux/schnell",
    price: 10,
    provider: "fal",
    badge: "Fast",
    version: "v1.0",
    description: "Ultra-fast 4-step generation model by Black Forest Labs, optimized for real-time synthesis.",
  },
  "Flux Dev": {
    name: "fal-ai/flux/dev",
    price: 15,
    provider: "fal",
    badge: "High Detail",
    version: "v1.0",
    description: "12B parameter state-of-the-art open weights model delivering incredible prompt adherence and photorealism.",
  },
  "Flux Pro v1.1": {
    name: "fal-ai/flux-pro/v1.1",
    price: 20,
    provider: "fal",
    badge: "Studio Pro",
    version: "v1.1",
    description: "Next-generation professional FLUX model with enhanced composition, finer micro-textures, and high resolution.",
  },
  "Recraft V3": {
    name: "fal-ai/recraft-v3",
    price: 15,
    provider: "fal",
    badge: "Design & Vector",
    version: "v3.0",
    description: "Exceptional graphic design model excelling at complex text typography, vector illustrations, and brand aesthetics.",
  },
  "Stable Diffusion 3.5 Large": {
    name: "fal-ai/stable-diffusion-v35-large",
    price: 15,
    provider: "fal",
    badge: "MMDiT",
    version: "v3.5",
    description: "Stability AI's flagship Multimodal Diffusion Transformer offering superb prompt fidelity and realistic human anatomy.",
  },
  "Ideogram v2": {
    name: "fal-ai/ideogram/v2",
    price: 15,
    provider: "fal",
    badge: "Typography",
    version: "v2.0",
    description: "Industry leader in accurate typography rendering, graphic posters, logos, and stylized compositions.",
  },
};

const initialState: ModelsState = {
  imageModels: initialImageModels,
  chatModels: {},
  audioModels: {},
  videoModels: {},
  selectedImageModel: "Flux Schnell",
};

export const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setModels: (
      state,
      action: PayloadAction<{
        imageModels?: Record<string, ModelItem>;
        chatModels?: Record<string, any>;
        audioModels?: Record<string, any>;
        videoModels?: Record<string, any>;
      }>
    ) => {
      if (action.payload.imageModels && Object.keys(action.payload.imageModels).length > 0) {
        state.imageModels = action.payload.imageModels;
        // If current selectedImageModel doesn't exist in new list, pick the first one
        if (!state.imageModels[state.selectedImageModel]) {
          state.selectedImageModel = Object.keys(state.imageModels)[0];
        }
      }
      if (action.payload.chatModels) {
        state.chatModels = action.payload.chatModels;
      }
      if (action.payload.audioModels) {
        state.audioModels = action.payload.audioModels;
      }
      if (action.payload.videoModels) {
        state.videoModels = action.payload.videoModels;
      }
    },
    setSelectedImageModel: (state, action: PayloadAction<string>) => {
      state.selectedImageModel = action.payload;
    },
  },
});

export const { setModels, setSelectedImageModel } = modelsSlice.actions;
export default modelsSlice.reducer;
