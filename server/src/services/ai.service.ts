import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from 'ai';
import { fal } from "@fal-ai/client";
import { FAL_API_KEY, OPENROUTER_API_KEY } from '@/utils/config.util.js';
import { aiChatModels } from '@/utils/ai.util.js';



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

    async generateImage(prompt: string): Promise<void> {
        try{

            const result = await fal.subscribe("fal-ai/flux/schnell", {
                input: {
                    prompt: "A futuristic cyberpunk city at night, cinematic lighting, highly detailed",
                    image_size: "square_hd",
                    num_images: 1,
                },
                
                logs: true,
                
                onQueueUpdate(update) {
                    if (update.status === "IN_PROGRESS") {
                        update.logs?.forEach((log) => console.log(log.message));
                    }
                },
            });
            
            console.log(result.data);
            console.log(result.data.images[0].url);
        }
        catch (error) {
            console.error("Error generating image with FalAI:", error);
        }

    }
    
    


}

export const falAI = new FalAI(FAL_API_KEY);