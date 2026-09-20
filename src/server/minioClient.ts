import { Client } from 'minio';

let minioClient: Client | null = null;

export function getMinioClient(): Client | null {
  if (minioClient) return minioClient;

  const endpoint = process.env.MINIO_ENDPOINT || process.env.MINIO_HOST_EXTERNAL;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    return null;
  }

  try {
    const cleanEndpoint = endpoint
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .trim();

    const clientConfig: any = {
      endPoint: cleanEndpoint,
      accessKey,
      secretKey,
    };

    if (process.env.MINIO_PORT) {
      clientConfig.port = parseInt(process.env.MINIO_PORT, 10);
    }
    if (process.env.MINIO_USE_SSL !== undefined) {
      clientConfig.useSSL = process.env.MINIO_USE_SSL === 'true';
    }

    minioClient = new Client(clientConfig);

    return minioClient;
  } catch (err) {
    console.error('[MinIO] Error creating MinIO client:', err);
    return null;
  }
}

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'silkprint-artes';

/**
 * Ensures bucket exists
 */
export async function ensureMinioBucket(): Promise<boolean> {
  const client = getMinioClient();
  if (!client) return false;

  try {
    const exists = await client.bucketExists(BUCKET_NAME);
    if (!exists) {
      await client.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`[MinIO] Bucket "${BUCKET_NAME}" created successfully on VPS.`);
    }
    return true;
  } catch (err) {
    console.warn(`[MinIO] Bucket check warning:`, err);
    return false;
  }
}

/**
 * Uploads a file buffer to MinIO VPS
 */
export async function uploadToMinio(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string; key: string } | null> {
  const client = getMinioClient();
  if (!client) {
    return null;
  }

  try {
    await ensureMinioBucket();
    const objectKey = `${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

    await client.putObject(BUCKET_NAME, objectKey, fileBuffer, fileBuffer.length, {
      'Content-Type': contentType,
    });

    // Determine public URL
    const publicUrl = process.env.MINIO_PUBLIC_URL
      ? `${process.env.MINIO_PUBLIC_URL}/${BUCKET_NAME}/${objectKey}`
      : `/api/files/${objectKey}`;

    return {
      url: publicUrl,
      key: objectKey,
    };
  } catch (err) {
    console.error('[MinIO] Upload error:', err);
    return null;
  }
}

/**
 * Get download stream or presigned URL from MinIO
 */
export async function getMinioPresignedUrl(objectKey: string): Promise<string | null> {
  const client = getMinioClient();
  if (!client) return null;

  try {
    return await client.presignedGetObject(BUCKET_NAME, objectKey, 24 * 60 * 60);
  } catch (err) {
    console.error('[MinIO] Presigned URL error:', err);
    return null;
  }
}
