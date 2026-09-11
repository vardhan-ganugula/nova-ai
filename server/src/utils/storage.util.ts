import R2Service from "@/services/r2.service.js";
import axios from "axios";
import sharp from "sharp";

const r2Service = R2Service.getInstance();

export const addWatermarkToBuffer = async (buffer: Buffer): Promise<Buffer> => {
    try {
        const metadata = await sharp(buffer).metadata();
        const width = metadata.width || 1024;
        const height = metadata.height || 1024;

        // Proportional sizing for watermark badge
        const badgeWidth = Math.max(180, Math.round(width * 0.22));
        const badgeHeight = Math.max(40, Math.round(badgeWidth * 0.23));
        const fontSize = Math.max(11, Math.round(badgeHeight * 0.42));

        const svgWatermark = Buffer.from(`
            <svg width="${badgeWidth}" height="${badgeHeight}" viewBox="0 0 ${badgeWidth} ${badgeHeight}">
                <rect x="0" y="0" width="${badgeWidth}" height="${badgeHeight}" rx="${Math.round(badgeHeight / 2)}" fill="rgba(15, 23, 42, 0.82)" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1.5" />
                <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}px" font-weight="800" fill="#ffffff" letter-spacing="1.5">
                    &#9889; NOVA AI GALLERY
                </text>
            </svg>
        `);

        return await sharp(buffer)
            .composite([
                {
                    input: svgWatermark,
                    gravity: "southeast",
                },
            ])
            .toBuffer();
    } catch (err) {
        console.error("Failed to add watermark with sharp:", err);
        return buffer;
    }
};

export const uploadFromFalToR2WithWatermark = async (
    url: string,
    path: string = 'images',
    filename: string = `${Date.now()}.jpg`
): Promise<{
    original: { key: string; presignedUrl: string };
    watermarked: { key: string; presignedUrl: string };
}> => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const originalBuffer = Buffer.from(response.data);
    const contentType = typeof response.headers['content-type'] === 'string' ? response.headers['content-type'] : 'image/jpeg';
    
    // 1. Upload original master
    const originalKey = `${path}/${filename}`;
    await r2Service.uploadObject(originalKey, originalBuffer, contentType);
    const originalPresignedUrl = await r2Service.generatePresignedURL(originalKey, 7 * 24 * 3600);

    // 2. Generate and upload watermarked copy for the public gallery
    const watermarkedBuffer = await addWatermarkToBuffer(originalBuffer);
    const watermarkedKey = `${path}/watermarked/wm_${filename}`;
    await r2Service.uploadObject(watermarkedKey, watermarkedBuffer, contentType);
    const watermarkedPresignedUrl = await r2Service.generatePresignedURL(watermarkedKey, 7 * 24 * 3600);

    return {
        original: { key: originalKey, presignedUrl: originalPresignedUrl },
        watermarked: { key: watermarkedKey, presignedUrl: watermarkedPresignedUrl },
    };
};

export const uploadFromFalToR2 = async (
    url: string,
    path: string = 'images',
    filename: string = `${Date.now()}.jpg`
): Promise<{ key: string; presignedUrl: string }> => {
    const result = await uploadFromFalToR2WithWatermark(url, path, filename);
    return result.original;
};

export const generatePresignedURL = async (path: string, expiresIn: number = 3600): Promise<string> => {
    return await r2Service.generatePresignedURL(path, expiresIn);
};

export const deleteObjectFromR2 = async (path: string): Promise<void> => {
    await r2Service.deleteObject(path);
};