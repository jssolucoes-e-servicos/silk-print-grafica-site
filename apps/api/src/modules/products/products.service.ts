import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private db: DatabaseService) {}

  async getCatalog() {
    // Tenta carregar do PostgreSQL se disponível
    if (this.db.isDatabaseConnected()) {
      try {
        const prodRes = await this.db.query('SELECT * FROM products ORDER BY popular DESC, id ASC');
        const catRes = await this.db.query('SELECT * FROM categories ORDER BY id ASC');
        if (prodRes && prodRes.rows && prodRes.rows.length > 0) {
          return {
            products: prodRes.rows.map(r => ({
              ...r,
              formats: typeof r.formats === 'string' ? JSON.parse(r.formats) : r.formats,
              papers: typeof r.papers === 'string' ? JSON.parse(r.papers) : r.papers,
              colorModes: typeof r.color_modes === 'string' ? JSON.parse(r.color_modes) : r.color_modes,
              finishes: typeof r.finishes === 'string' ? JSON.parse(r.finishes) : r.finishes,
              quantities: typeof r.quantities === 'string' ? JSON.parse(r.quantities) : r.quantities,
              bleedSpecs: typeof r.bleed_specs === 'string' ? JSON.parse(r.bleed_specs) : r.bleed_specs,
              gabaritos: typeof r.gabaritos === 'string' ? JSON.parse(r.gabaritos) : r.gabaritos,
            })),
            categories: catRes?.rows || [],
          };
        }
      } catch (err: any) {
        this.logger.warn(`Fallback para catálogo padrão: ${err?.message}`);
      }
    }

    // Catálogo padrão de alta performance
    return {
      siteInfo: {
        name: 'Silk Print Gráfica & Brindes',
        tagline: 'Sua parceira gráfica em alta definição e grandes tiragens',
        phone: '(11) 99999-8888',
        whatsapp: '5511999998888',
        email: 'contato@silkprint.com.br',
        adminEmail: 'producao@silkprint.com.br',
        address: 'São Paulo - SP',
        businessHours: 'Segunda a Sexta: 08:00 às 18:00',
      },
      categories: [
        { id: 'cartoes', name: 'Cartões de Visita', slug: 'cartoes-de-visita', icon: 'CreditCard', count: '12 modelos' },
        { id: 'panfletos', name: 'Panfletos & Folhetos', slug: 'panfletos-folhetos', icon: 'FileText', count: '8 formatos' },
        { id: 'adesivos', name: 'Adesivos & Rótulos', slug: 'adesivos-rotulos', icon: 'Tag', count: '15 opções' },
        { id: 'banners', name: 'Banners & Faixas', slug: 'banners-faixas', icon: 'Maximize', count: '6 tamanhos' },
        { id: 'pastas', name: 'Pastas & Envelopes', slug: 'pastas-envelopes', icon: 'Folder', count: '5 modelos' },
        { id: 'blocos', name: 'Blocos & Receituários', slug: 'blocos-receituarios', icon: 'Layers', count: '4 formatos' },
      ],
      products: [],
    };
  }

  async getProductBySlug(slug: string) {
    const catalog = await this.getCatalog();
    return catalog.products.find((p: any) => p.slug === slug) || null;
  }
}
