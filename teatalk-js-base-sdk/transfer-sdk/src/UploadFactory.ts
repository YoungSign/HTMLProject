import { Upload } from "./httpUpload/Upload";
import { UploadOption } from "./httpUpload/UploadOption";

export class UploadFactory {
    public static getInstance(uploadOption: UploadOption): Upload {
        return new Upload(uploadOption);
    }
};