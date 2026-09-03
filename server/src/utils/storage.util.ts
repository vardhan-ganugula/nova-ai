import R2Service from "@/services/r2.service.js";
import axios from "axios";

const r2Service = R2Service.getInstance();

export const uploadFromFalToR2 = async (

    url : string,
    path : string = '/temp',
    filename: string = 'profile.jpg'

): Promise<void> => {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const contentType = typeof response.headers['content-type'] === 'string' ? response.headers['content-type'] : 'application/octet-stream';
    await r2Service.uploadObject( path + '/' + filename, buffer, contentType);

}

export const generatePresignedURL = async (path: string, expiresIn: number = 3600): Promise<string> => {
    return await r2Service.generatePresignedURL(path, expiresIn);
}

export const deleteObjectFromR2 = async (path: string): Promise<void> => {
    await r2Service.deleteObject(path);
}