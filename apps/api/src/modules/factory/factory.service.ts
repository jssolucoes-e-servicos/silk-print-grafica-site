import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/database/database.service';

@Injectable()
export class FactoryService {
  private readonly logger = new Logger(FactoryService.name);

  private rawMaterials: any[] = [
    { id: 'mat_papel_couche_250', code: 'PAP-250', name: 'Papel Couché 250g (66x96)', category: 'papel', unit: 'resma', stockQty: 48, minStockQty: 15, costPrice: 285.00, supplierName: 'Suzano Papel' },
    { id: 'mat_papel_couche_300', code: 'PAP-300', name: 'Papel Couché 300g (66x96)', category: 'papel', unit: 'resma', stockQty: 32, minStockQty: 10, costPrice: 340.00, supplierName: 'Suzano Papel' },
    { id: 'mat_papel_offset_75', code: 'PAP-075', name: 'Papel Offset 75g (66x96)', category: 'papel', unit: 'resma', stockQty: 85, minStockQty: 25, costPrice: 110.00, supplierName: 'Klabin' },
    { id: 'mat_chapa_ctp_meia', code: 'CTP-01', name: 'Chapa CTP Térmica Meia Folha', category: 'chapa_ctp', unit: 'chapa', stockQty: 120, minStockQty: 40, costPrice: 22.50, supplierName: 'Agfa Graphics' },
    { id: 'mat_tinta_cmyk_kit', code: 'TIN-CMYK', name: 'Kit Tintas Escala Europa (4kg)', category: 'tinta', unit: 'lata_kg', stockQty: 14, minStockQty: 5, costPrice: 380.00, supplierName: 'Sun Chemical' },
    { id: 'mat_bopp_fosco', code: 'BOPP-FOS', name: 'Bobina BOPP Fosco Térmico 32cm', category: 'acabamento', unit: 'rolo_m', stockQty: 9, minStockQty: 3, costPrice: 195.00, supplierName: 'Polo Films' },
  ];

  constructor(private db: DatabaseService) {}

  async getRawMaterials() {
    return this.rawMaterials;
  }

  async updateRawMaterialStock(id: string, delta: number) {
    const item = this.rawMaterials.find(m => m.id === id);
    if (item) {
      item.stockQty += delta;
      return item;
    }
    return null;
  }

  /**
   * Calculadora Gráfica Industrial de Alta Precisão
   * Calcula: poses por folha (aproveitamento), chapas CTP, custo de papel,
   * quebra de máquina, custo hora-máquina e preço sugerido de venda com markup.
   */
  calculateGraphicBudget(data: {
    sheetFormat: string; // ex: 66x96 cm
    finalFormat: string; // ex: 9x5 cm, A4 (21x29.7)
    posesPerSheet: number;
    printColors: '4x0' | '4x4' | '1x0' | '1x1';
    quantity: number;
    paperCostPerSheet: number;
    finishingCostTotal: number;
    markupPercent: number;
  }) {
    const poses = data.posesPerSheet > 0 ? data.posesPerSheet : 24;
    const baseSheetsNeeded = Math.ceil(data.quantity / poses);
    
    // Margem de quebra técnica de acerto de máquina
    const wasteRate = data.quantity > 5000 ? 0.05 : data.quantity > 1000 ? 0.08 : 0.12;
    const wasteSheets = Math.ceil(baseSheetsNeeded * wasteRate) + 20; // 20 folhas de acerto
    const totalSheets = baseSheetsNeeded + wasteSheets;

    // Chapas CTP
    const ctpPlatesCount = data.printColors === '4x4' ? 8 : data.printColors === '4x0' ? 4 : data.printColors === '1x1' ? 2 : 1;
    const costCtp = ctpPlatesCount * 22.50;

    // Custos
    const costPaper = totalSheets * (data.paperCostPerSheet || 0.60);
    const costPrinting = Math.max(80, totalSheets * 0.15); // Custo hora/milheiro máquina
    const costFinishing = Number(data.finishingCostTotal) || 0;

    const costTotal = costPaper + costCtp + costPrinting + costFinishing;
    const markupMultiplier = 1 + (Number(data.markupPercent) || 50) / 100;
    const suggestedSalePrice = costTotal * markupMultiplier;
    const unitPrice = suggestedSalePrice / data.quantity;

    return {
      posesPerSheet: poses,
      sheetsNeeded: baseSheetsNeeded,
      wasteSheets,
      totalSheets,
      ctpPlatesCount,
      costPaper: Number(costPaper.toFixed(2)),
      costCtp: Number(costCtp.toFixed(2)),
      costPrinting: Number(costPrinting.toFixed(2)),
      costFinishing: Number(costFinishing.toFixed(2)),
      costTotal: Number(costTotal.toFixed(2)),
      markupPercent: data.markupPercent,
      suggestedSalePrice: Number(suggestedSalePrice.toFixed(2)),
      unitPrice: Number(unitPrice.toFixed(4)),
    };
  }
}
