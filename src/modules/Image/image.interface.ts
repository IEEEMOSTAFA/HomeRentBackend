/**
 * Image Module Interface Definitions
 */

export interface IUploadResponse {
  url: string;
  filename: string;
  size: number;
}

export interface IUploadMultipleResponse {
  urls: string[];
  count: number;
  filenames: string[];
}

export interface IDeleteRequest {
  imageUrl: string;
}

export interface IDeleteMultipleRequest {
  imageUrls: string[];
}

export interface ICloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
}

export interface IImageServiceResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}
