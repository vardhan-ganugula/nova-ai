import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { fal } from "@fal-ai/client";
import { FAL_API_KEY, OPENROUTER_API_KEY } from '@/utils/config.util.js';
import { aiChatModels, aiImageModels } from '@/utils/ai.util.js';
import { applyStyleToPrompt } from '@/utils/style.util.js';



const openrouter = createOpenRouter({ apiKey: OPENROUTER_API_KEY  });


export async function generateTextWithOpenRouter(prompt: string, modelName: keyof typeof aiChatModels): Promise<string> {
    const selectedModel = aiChatModels[modelName];
    const llmModelName = selectedModel?.name ?? modelName;
    console.log(`Using model: ${llmModelName} for prompt: ${prompt}`);
    const model = openrouter(llmModelName, {
        extraBody: {
            reasoning: {
                "maxTokens": 64000,
                "price": 10,
            }
        }
    })

    const { text } = await generateText({ model, prompt });

    return text;
}


class FalAI {
    constructor(apiKey: string) {
        fal.config({
            credentials: apiKey,
        });
    }

    async generateImage(
        prompt: string,
        options?: { aspectRatio?: string; style?: string; negativePrompt?: string; model?: string }
    ): Promise<string> {
        // Resolve Fal.ai model endpoint first
        let endpoint = "fal-ai/flux/schnell";
        if (options?.model) {
            const matchedModel = (aiImageModels as Record<string, any>)[options.model];
            if (matchedModel?.name) {
                endpoint = matchedModel.name;
            } else if (options.model.startsWith("fal-ai/")) {
                endpoint = options.model;
            } else {
                const found = Object.entries(aiImageModels).find(
                    ([k, v]) => k.toLowerCase() === options.model?.toLowerCase() || v.name.toLowerCase() === options.model?.toLowerCase()
                );
                if (found) {
                    endpoint = found[1].name;
                }
            }
        }

        // Apply rich style presets, extract embedded negative prompts, and resolve conflicting terms
        const { styledPrompt, finalNegativePrompt } = applyStyleToPrompt(
            prompt,
            options?.style,
            options?.negativePrompt
        );

        let imageSize: any = "landscape_16_9";
        if (options?.aspectRatio === "1:1") imageSize = "square_hd";
        else if (options?.aspectRatio === "9:16") imageSize = "portrait_16_9";
        else if (options?.aspectRatio === "4:3") imageSize = "landscape_4_3";
        else if (options?.aspectRatio === "16:9") imageSize = "landscape_16_9";

        const inputPayload: Record<string, any> = {
            prompt: styledPrompt || "A futuristic cyberpunk city at night, cinematic lighting, highly detailed",
            image_size: imageSize,
            num_images: 1,
        };

        const isFlux = endpoint.toLowerCase().includes("flux");
        if (finalNegativePrompt && !isFlux) {
            inputPayload.negative_prompt = finalNegativePrompt;
        }

        if (endpoint.includes("ideogram")) {
            inputPayload.aspect_ratio = options?.aspectRatio || "16:9";
            if (finalNegativePrompt) {
                inputPayload.negative_prompt = finalNegativePrompt;
            }
        }

        const result: any = await fal.subscribe(endpoint as any, {
            input: inputPayload,
            logs: true,
            onQueueUpdate(update) {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.forEach((log) => console.log(log.message));
                }
            },
        });
        
        const imageUrl = result?.data?.images?.[0]?.url || result?.images?.[0]?.url || result?.image?.url || result?.data?.image?.url;
        if (!imageUrl) {
            throw new Error("No image returned from Fal AI");
        }
        return imageUrl;
    }

    async generateVideo(prompt: string): Promise<string> {
        const result: any = await fal.subscribe("fal-ai/kling-video/v1/standard/text-to-video", {
            input: {
                prompt: prompt || "Cinematic aerial shot of futuristic city",
                duration: "5",
                aspect_ratio: "16:9",
            },
            logs: true,
            onQueueUpdate(update) {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.forEach((log) => console.log(log.message));
                }
            },
        });

        const videoUrl = result?.data?.video?.url || result?.data?.videos?.[0]?.url;
        if (!videoUrl) {
            throw new Error("No video returned from Fal AI");
        }
        return videoUrl;
    }

    async upscaleImage(imageUrl: string): Promise<string> {
        const result: any = await fal.subscribe("fal-ai/clarity-upscaler", {
            input: {
                image_url: imageUrl,
            },
            logs: true,
        });

        const upscaledUrl = result?.data?.image?.url;
        if (!upscaledUrl) {
            throw new Error("No upscaled image returned from Fal AI");
        }
        return upscaledUrl;
    }

    async removeBackground(imageUrl: string): Promise<string> {
        const result: any = await fal.subscribe("fal-ai/birefnet", {
            input: {
                image_url: imageUrl,
            },
            logs: true,
        });

        const noBgUrl = result?.data?.image?.url;
        if (!noBgUrl) {
            throw new Error("No background-removed image returned from Fal AI");
        }
        return noBgUrl;
    }
}

export const falAI = new FalAI(FAL_API_KEY);