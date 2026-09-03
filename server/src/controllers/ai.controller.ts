import {falAI} from '@/services/ai.service.js';


export async function generateImageWithFalAI(prompt: string): Promise<void> {
    await falAI.generateImage(prompt);
}