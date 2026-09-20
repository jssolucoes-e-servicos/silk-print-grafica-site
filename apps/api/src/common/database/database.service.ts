import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      this.logger.warn('DATABASE_URL não configurada. Operando em modo memória.');
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: databaseUrl,
        max: 20, // Pool de conexões para alta volumetria
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: databaseUrl.includes('sslmode=require') || databaseUrl.includes('neon') || databaseUrl.includes('supabase')
          ? { rejectUnauthorized: false }
          : false,
      });

      const client = await this.pool.connect();
      client.release();
      this.isConnected = true;
      this.logger.log(' Conectado com sucesso ao PostgreSQL com Pool de Conexões.');
    } catch (err: any) {
      this.logger.error(` Falha ao conectar ao PostgreSQL: ${err?.message}`);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Pool de conexões PostgreSQL encerrado com sucesso.');
    }
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T> | null> {
    if (!this.pool || !this.isConnected) {
      return null;
    }
    try {
      return await this.pool.query<T>(text, params);
    } catch (err: any) {
      this.logger.error(`Erro na consulta SQL: ${err?.message}`, err?.stack);
      throw err;
    }
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }
}
