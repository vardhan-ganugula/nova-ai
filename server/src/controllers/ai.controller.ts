import { falAI } from '@/services/ai.service.js';

export async function generateImageWithFalAI(
    prompt: string, 
    options?: { 
        aspectRatio?: string; 
        style?: string; 
        negativePrompt?: string; 
        model?: string;
        guidanceScale?: number;
        steps?: number;
        seed?: number;
        sampler?: string;
    }
): Promise<string> {
    return await falAI.generateImage(prompt, options);
}

export async function generateVideoWithFalAI(prompt: string): Promise<string> {
    return await falAI.generateVideo(prompt);
}

export async function upscaleImageWithFalAI(imageUrl: string): Promise<string> {
    return await falAI.upscaleImage(imageUrl);
}

export async function removeBackgroundWithFalAI(imageUrl: string): Promise<string> {
    return await falAI.removeBackground(imageUrl);
}