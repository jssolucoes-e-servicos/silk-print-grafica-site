import { MinioConfig, MinioBucketItem, MinioFileItem } from '../types';

const MINIO_CONFIG_STORAGE_KEY = 'smartgraph_minio_config';

export const DEFAULT_MINIO_CONFIG: MinioConfig = {
  endpoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  bucket: 'silkprint-files',
  status: 'disconnected',
};

export function getStoredMinioConfig(): MinioConfig {
  try {
    const saved = localStorage.getItem(MINIO_CONFIG_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_MINIO_CONFIG, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.error('Error loading stored minio config:', err);
  }
  return DEFAULT_MINIO_CONFIG;
}

export function saveStoredMinioConfig(config: MinioConfig): void {
  try {
    localStorage.setItem(MINIO_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving stored minio config:', err);
  }
}

/**
 * Fetch current MinIO config from backend
 */
export async function fetchMinioConfig(): Promise<MinioConfig> {
  try {
    const res = await fetch('/api/minio/config');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching MinIO config:', err);
  }
  return getStoredMinioConfig();
}

/**
 * Test MinIO Connection & List Buckets
 */
export async function testMinioConnection(config: MinioConfig): Promise<{
  success: boolean;
  message: string;
  latencyMs: number;
  buckets: MinioBucketItem[];
  totalBuckets: number;
}> {
  try {
    const res = await fetch('/api/minio/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const result = await res.json();
    if (result.success) {
      saveStoredMinioConfig({
        ...config,
        status: 'connected',
        totalBuckets: result.totalBuckets,
      });
    }
    return result;
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao testar conexão MinIO: ${err.message || 'Falha de rede'}`,
      latencyMs: 0,
      buckets: [],
      totalBuckets: 0,
    };
  }
}

/**
 * List files in bucket
 */
export async function listMinioFiles(bucketName?: string): Promise<{
  success: boolean;
  files: MinioFileItem[];
  message?: string;
}> {
  try {
    const q = bucketName ? `?bucket=${encodeURIComponent(bucketName)}` : '';
    const res = await fetch(`/api/minio/files${q}`);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      files: [],
      message: err.message,
    };
  }
}

/**
 * Upload real file to MinIO
 */
export async function uploadMinioFile(
  file: File,
  category: 'arte' | 'comprovante' | 'relatorio' | 'geral' = 'geral',
  bucketName?: string
): Promise<{
  success: boolean;
  filename: string;
  url?: string;
  size: number;
  message?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (bucketName) {
      formData.append('bucket', bucketName);
    }

    const res = await fetch('/api/minio/upload', {
      method: 'POST',
      body: formData,
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      filename: file.name,
      size: file.size,
      message: `Erro no upload: ${err.message}`,
    };
  }
}

/**
 * Delete a file in MinIO
 */
export async function deleteMinioFile(filename: string, bucketName?: string): Promise<{ success: boolean; message: string }> {
  try {
    const q = bucketName ? `?bucket=${encodeURIComponent(bucketName)}` : '';
    const res = await fetch(`/api/minio/files/${encodeURIComponent(filename)}${q}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao excluir: ${err.message}`,
    };
  }
}

/**
 * Create a new bucket in MinIO
 */
export async function createMinioBucket(bucketName: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/minio/buckets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucketName }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao criar bucket: ${err.message}`,
    };
  }
}

/**
 * Trigger product JSON replication to MinIO bucket
 */
export async function triggerProductsReplicaToMinio(bucketName?: string): Promise<{
  success: boolean;
  message: string;
  url?: string;
  size?: number;
  timestamp?: string;
}> {
  try {
    const res = await fetch('/api/minio/replica/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket: bucketName }),
    });
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao replicar: ${err.message}`,
    };
  }
}

/**
 * Fetch high-speed cached catalog from MinIO JSON replica
 */
export async function fetchCachedCatalogFromMinio(): Promise<any> {
  try {
    const res = await fetch('/api/catalog/cached');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Erro ao ler réplica do MinIO:', err);
  }
  return null;
}

