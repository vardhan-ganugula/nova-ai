import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { 
    CLOUDFLARE_R2_ENDPOINT, 
    CLOUDFLARE_ACCESS_KEY_ID, 
    CLOUDFLARE_SECRET_ACCESS_KEY, 
    CLOUDFLARE_R2_BUCKET_NAME 
} from "@/utils/config.util.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


class R2Service {
    private static instance: R2Service;
    private r2Client: S3Client;

    public static getInstance(): R2Service {
        if (!R2Service.instance) {
            R2Service.instance = new R2Service();
        }
        return R2Service.instance;
    }

    private constructor() {
        this.r2Client = new S3Client({
            region: "auto",
            endpoint: CLOUDFLARE_R2_ENDPOINT,
            credentials: {
                accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
                secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
            },
        });
    }


    public uploadObject = async (key: string, body: Buffer, contentType: string): Promise<void> => {
        try {
            await this.r2Client.send(new PutObjectCommand({
                Bucket: CLOUDFLARE_R2_BUCKET_NAME,
                Key: key,
                Body: body,
                ContentType: contentType
            }));
        } catch (error) {
            console.error("Error uploading object to R2:", error);
            throw new Error("Failed to upload object to R2");
        }
    }


    public async generatePresignedURL(
        path: string,
        expiresIn: number = 3600
    
    ): Promise<string> {
        
        try {
            const command = new GetObjectCommand({
                Bucket: CLOUDFLARE_R2_BUCKET_NAME,
                Key: path,
            });
            const url = await getSignedUrl(this.r2Client, command, { expiresIn });
            return url;
        }
        catch(error) {
            console.error("Error generating presigned URL:", error);
            throw error;
        }
    
    }

    public async deleteObject(path: string): Promise<void> {
        try {
            await this.r2Client.send(new DeleteObjectCommand({
                Bucket: CLOUDFLARE_R2_BUCKET_NAME,
                Key: path,
            }));
        } catch (error) {
            console.error("Error deleting object from R2:", error);
            throw new Error("Failed to delete object from R2");
        } 
    }

    public generatePresignedURLS(
        paths: string[],
        expiresIn: number = 3600
    ): Promise<string[]> {
        const promises = paths.map(path => this.generatePresignedURL(path, expiresIn));
        return Promise.all(promises);
    }
}

export default R2Service;