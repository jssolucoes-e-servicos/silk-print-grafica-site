import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FolderPlus,
  Trash2,
  Download,
  FileText,
  Image as ImageIcon,
  RotateCw,
  Save,
  Server,
  Key,
  Shield,
  Layers,
  File,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MinioConfig, MinioBucketItem, MinioFileItem } from '../../../types';
import {
  fetchMinioConfig,
  saveStoredMinioConfig,
  testMinioConnection,
  listMinioFiles,
  uploadMinioFile,
  deleteMinioFile,
  createMinioBucket,
  triggerProductsReplicaToMinio,
} from '../../../lib/minioApi';
import confetti from 'canvas-confetti';

export const MinioTab: React.FC = () => {
  const [config, setConfig] = useState<MinioConfig>({
    endpoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    bucket: 'silkprint-files',
    status: 'disconnected',
  });

  const [isTesting, setIsTesting] = useState(false);
  const [buckets, setBuckets] = useState<MinioBucketItem[]>([]);
  const [files, setFiles] = useState<MinioFileItem[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>('silkprint-files');
  const [newBucketName, setNewBucketName] = useState('');
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplicating, setIsReplicating] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<'arte' | 'comprovante' | 'relatorio' | 'geral'>('arte');

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
  } | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchMinioConfig().then((data) => {
      setConfig(data);
      if (data.bucket) setSelectedBucket(data.bucket);
    });
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoredMinioConfig(config);
    try {
      await fetch('/api/minio/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setFeedbackMsg({ success: true, message: 'Parâmetros do MinIO salvos com sucesso!' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testMinioConnection(config);
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      setBuckets(res.buckets || []);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      loadFiles(config.bucket);
    }
  };

  const loadFiles = async (bucket?: string) => {
    setIsLoadingFiles(true);
    const res = await listMinioFiles(bucket || selectedBucket);
    if (res.success) {
      setFiles(res.files);
    }
    setIsLoadingFiles(false);
  };

  const handleCreateBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketName.trim() || isCreatingBucket) return;
    setIsCreatingBucket(true);
    const res = await createMinioBucket(newBucketName);
    setIsCreatingBucket(false);
    if (res.success) {
      setNewBucketName('');
      handleTestConnection();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setIsUploading(true);
    const file = fileList[0];
    const res = await uploadMinioFile(file, uploadCategory, selectedBucket);
    setIsUploading(false);

    if (res.success) {
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.7 } });
      loadFiles(selectedBucket);
      setFeedbackMsg({ success: true, message: `Arquivo "${file.name}" enviado com sucesso ao MinIO!` });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ success: false, message: res.message || 'Falha no upload' });
    }
  };

  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Deseja realmente remover o arquivo "${filename}" do MinIO?`)) return;
    const res = await deleteMinioFile(filename, selectedBucket);
    if (res.success) {
      loadFiles(selectedBucket);
    }
  };

  const handleReplicateProductsToMinio = async () => {
    setIsReplicating(true);
    setFeedbackMsg(null);
    try {
      const res = await triggerProductsReplicaToMinio(selectedBucket);
      if (res.success) {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        setFeedbackMsg({
          success: true,
          message: `${res.message} (Tamanho: ${formatFileSize(res.size || 0)}). O e-commerce agora pode ler o catálogo do MinIO em cache de alta velocidade sem sobrecarregar o banco de dados!`,
        });
        loadFiles(selectedBucket);
      } else {
        setFeedbackMsg({
          success: false,
          message: res.message || 'Falha ao sincronizar réplica com MinIO.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        success: false,
        message: `Erro na réplica: ${err.message}`,
      });
    } finally {
      setIsReplicating(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-red-950/40 via-zinc-900 to-rose-950/40 border border-red-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
            <HardDrive className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-zinc-100">Armazenamento de Arquivos MinIO (S3)</h2>
              <span
                className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                  config.status === 'connected'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                {config.status === 'connected' ? '● Conectado' : '○ Não Conectado'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Guarde artes gráficas em alta resolução, comprovantes PIX, notas fiscais e relatórios em buckets S3 privados no seu MinIO.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleReplicateProductsToMinio}
            disabled={isReplicating}
            className="px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 disabled:opacity-50 text-amber-300 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            title="Exporta todos os produtos do PostgreSQL para um JSON no MinIO, criando réplica de leitura rápida para o e-commerce"
          >
            <Sparkles className={`w-4 h-4 ${isReplicating ? 'animate-spin' : ''}`} />
            <span>{isReplicating ? 'Replicando JSON...' : 'Replicar Produtos no MinIO (Read-Replica)'}</span>
          </button>

          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <RotateCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testando MinIO...' : 'Testar Conexão S3'}</span>
          </button>
        </div>
      </div>

      {/* Test Result Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold">{testResult.message}</span>
              {testResult.latencyMs !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-zinc-900 border border-zinc-700 text-emerald-300">
                  {testResult.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            feedbackMsg.success
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800 text-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MinIO Config Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Server className="w-4 h-4 text-red-400" />
              <span>Parâmetros do Servidor MinIO</span>
            </h3>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Endpoint / IP</label>
                  <input
                    type="text"
                    value={config.endpoint}
                    onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                    placeholder="localhost ou minio.meuservidor.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Porta</label>
                  <input
                    type="number"
                    value={config.port}
                    onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value, 10) || 9000 })}
                    placeholder="9000"
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Access Key</label>
                  <input
                    type="text"
                    value={config.accessKey}
                    onChange={(e) => setConfig({ ...config, accessKey: e.target.value })}
                    placeholder="minioadmin"
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-6 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Secret Key</label>
                  <input
                    type="password"
                    value={config.secretKey || ''}
                    onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Bucket Padrão</label>
                  <input
                    type="text"
                    value={config.bucket}
                    onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
                    placeholder="silkprint-files"
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-red-500 font-mono"
                  />
                </div>
                <div className="sm:col-span-4 flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.useSSL}
                      onChange={(e) => setConfig({ ...config, useSSL: e.target.checked })}
                      className="rounded border-zinc-700 text-red-600 focus:ring-red-500"
                    />
                    <span>Usar HTTPS / SSL</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Parâmetros</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Real File Upload & Buckets Manager */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Upload Real de Arte / Arquivo no MinIO</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-300 font-medium">Categoria do Arquivo:</span>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="px-3 py-1.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden"
                >
                  <option value="arte">🎨 Arte Gráfica / Prova</option>
                  <option value="comprovante">🧾 Comprovante PIX</option>
                  <option value="relatorio">📊 Relatório / Planilha</option>
                  <option value="geral">📁 Arquivo Geral</option>
                </select>
              </div>

              <label className="border-2 border-dashed border-zinc-700 hover:border-red-500/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-zinc-950/60 hover:bg-zinc-950">
                <UploadCloud className={`w-8 h-8 ${isUploading ? 'animate-bounce text-emerald-400' : 'text-zinc-500'}`} />
                <span className="text-xs font-semibold text-zinc-200">
                  {isUploading ? 'Enviando para o MinIO S3...' : 'Clique para selecionar arquivo real ou arraste aqui'}
                </span>
                <span className="text-[11px] text-zinc-500">
                  PDF, PNG, JPG, CDR, AI, PSD ou ZIP (até 50MB)
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* MinIO Read-Replica de Catálogo Card */}
          <div className="rounded-2xl bg-amber-950/20 border border-amber-800/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cache Read-Replica de Produtos (JSON no MinIO)</h4>
                  <p className="text-[11px] text-zinc-400">Evita sobrecarga no PostgreSQL servindo o catálogo via S3</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Performance
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Sempre que novos produtos forem cadastrados ou atualizados, a réplica em <code className="text-amber-300 font-mono text-[11px]">catalog/products-replica.json</code> armazena o snapshot completo no MinIO para que o e-commerce possa ler instantaneamente sem emitir queries ao PostgreSQL.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleReplicateProductsToMinio}
                disabled={isReplicating}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <Zap className={`w-3.5 h-3.5 ${isReplicating ? 'animate-spin' : ''}`} />
                <span>{isReplicating ? 'Gerando Réplica...' : 'Sincronizar Réplica de Produtos Agora'}</span>
              </button>

              <a
                href={`/api/minio/download/${encodeURIComponent(selectedBucket)}/catalog%2Fproducts-replica.json`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Ver JSON Replicado</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Real Files List */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              Arquivos Armazenados no Bucket "{selectedBucket}" ({files.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => loadFiles(selectedBucket)}
            disabled={isLoadingFiles}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            <span>Atualizar Lista</span>
          </button>
        </div>

        {files.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
            <File className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-400 font-medium">Nenhum arquivo encontrado no bucket selecionado.</p>
            <p className="text-[11px] text-zinc-500">Faça upload de uma arte gráfica acima para testar o armazenamento real.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
            {files.map((f) => (
              <div key={f.name} className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                    {f.name.endsWith('.pdf') ? (
                      <FileText className="w-4 h-4 text-red-400" />
                    ) : f.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <File className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">{f.name}</div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                      <span>{formatFileSize(f.size)}</span>
                      <span>•</span>
                      <span>{new Date(f.lastModified).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/minio/download/${encodeURIComponent(selectedBucket)}/${encodeURIComponent(f.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Baixar / Visualizar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(f.name)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Excluir do MinIO"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
