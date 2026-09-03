import {Router} from "express"; 
import { generateTextWithOpenRouter } from "@services/ai.service.js";
import { generateImageWithFalAI } from "@/controllers/ai.controller.js";

const aiRouter = Router(); 



aiRouter.post("/generate-text", async (req, res) => {
    const { prompt, model } = req.body;
    try {
        const generatedText = await generateTextWithOpenRouter(prompt, model);
        res.json({ text: generatedText });
    } catch (error) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: "Failed to generate text" });
    }
});

aiRouter.post("/generate-image", async (req, res) => {
    const { prompt } = req.body;
    try {
        await generateImageWithFalAI(prompt);
        res.json({ message: "Image generation initiated successfully" });
    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }   
});




export default aiRouter;