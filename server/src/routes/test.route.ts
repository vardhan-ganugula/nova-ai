import {Router} from "express";
import { 
    generatePresignedURL, 
    uploadFromFalToR2, 
    deleteObjectFromR2
} from "@utils/storage.util.js";

const router = Router();


router.post('/image-upload', async (req, res) => {
    const { url, path } = req.body;
    if(!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        await uploadFromFalToR2(url, path);
        res.status(200).json({ message: 'Image uploaded successfully' });
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ error: 'Failed to upload image' });
    }

})

router.post('/generate-presigned-url', async (req, res) => {
    const { path, expiresIn } = req.body;
    try {
        const presignedURL = await generatePresignedURL(path, expiresIn);
        res.status(200).json({ presignedURL });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        res.status(500).json({ error: 'Failed to generate presigned URL' });
    }
});


router.delete('/delete-object', async (req, res) => {
    const { path } = req.body; 
    try {
        await deleteObjectFromR2(path);
        res.status(200).json({ message: 'Object deleted successfully' });
    } catch (error) {
        console.error("Error deleting object:", error);
        res.status(500).json({ error: 'Failed to delete object' });
    }
});


export default router;