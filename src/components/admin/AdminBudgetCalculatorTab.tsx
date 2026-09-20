import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Copy, 
  Printer, 
  Check, 
  Sparkles, 
  Layers, 
  FileText, 
  DollarSign, 
  Percent, 
  Clock, 
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { GraphicBudgetEstimate } from '../../types';

interface PresetJob {
  name: string;
  category: string;
  defaultFormat: string;
  widthMm: number;
  heightMm: number;
  defaultPaper: string;
  defaultColors: '4x0' | '4x4' | '1x0' | '1x1' | '4x1';
  defaultFinishes: string[];
}

const PRESET_JOBS: PresetJob[] = [
  {
    name: 'Cartão de Visita',
    category: 'Comercial',
    defaultFormat: '90x50 mm',
    widthMm: 90,
    heightMm: 50,
    defaultPaper: 'Couché 300g',
    defaultColors: '4x4',
    defaultFinishes: ['bopp_fosco', 'verniz_localizado', 'refile']
  },
  {
    name: 'Folheto / Flyer A5',
    category: 'Promocional',
    defaultFormat: '148x210 mm',
    widthMm: 148,
    heightMm: 210,
    defaultPaper: 'Couché 115g',
    defaultColors: '4x4',
    defaultFinishes: ['refile']
  },
  {
    name: 'Panfleto / Flyer A4',
    category: 'Promocional',
    defaultFormat: '210x297 mm',
    widthMm: 210,
    heightMm: 297,
    defaultPaper: 'Couché 150g',
    defaultColors: '4x4',
    defaultFinishes: ['refile']
  },
  {
    name: 'Folder com 2 Dobras (Trifólio)',
    category: 'Corporativo',
    defaultFormat: '210x297 mm (Aberto)',
    widthMm: 297,
    heightMm: 210,
    defaultPaper: 'Couché 150g',
    defaultColors: '4x4',
    defaultFinishes: ['dobra_2', 'refile']
  },
  {
    name: 'Pasta com Bolsa para Documentos',
    category: 'Corporativo',
    defaultFormat: '440x310 mm (Aberto)',
    widthMm: 440,
    heightMm: 310,
    defaultPaper: 'Supremo 300g',
    defaultColors: '4x0',
    defaultFinishes: ['bopp_fosco', 'corte_vinco', 'colagem_bolsa']
  },
  {
    name: 'Papel Timbrado A4',
    category: 'Papelaria',
    defaultFormat: '210x297 mm',
    widthMm: 210,
    heightMm: 297,
    defaultPaper: 'Offset 90g',
    defaultColors: '4x0',
    defaultFinishes: ['refile']
  },
  {
    name: 'Receituário / Bloco 50 Folhas',
    category: 'Papelaria',
    defaultFormat: '148x210 mm (A5)',
    widthMm: 148,
    heightMm: 210,
    defaultPaper: 'Offset 75g',
    defaultColors: '1x0',
    defaultFinishes: ['blocagem_cola', 'capa_kraft']
  }
];

const PAPERS_CATALOG = [
  { name: 'Couché 90g', type: 'Couché', gramature: 90, pricePerResma: 135.00 },
  { name: 'Couché 115g', type: 'Couché', gramature: 115, pricePerResma: 165.00 },
  { name: 'Couché 150g', type: 'Couché', gramature: 150, pricePerResma: 215.00 },
  { name: 'Couché 250g', type: 'Couché', gramature: 250, pricePerResma: 340.00 },
  { name: 'Couché 300g', type: 'Couché', gramature: 300, pricePerResma: 395.00 },
  { name: 'Offset 75g', type: 'Offset', gramature: 75, pricePerResma: 98.00 },
  { name: 'Offset 90g', type: 'Offset', gramature: 90, pricePerResma: 118.00 },
  { name: 'Offset 120g', type: 'Offset', gramature: 120, pricePerResma: 158.00 },
  { name: 'Supremo 300g', type: 'Cartão', gramature: 300, pricePerResma: 440.00 },
  { name: 'Kraft 200g', type: 'Especial', gramature: 200, pricePerResma: 280.00 },
  { name: 'Adesivo Vinil Brilho', type: 'Sintético', gramature: 120, pricePerResma: 520.00 }
];

const SHEET_FORMATS = [
  { name: '66 x 96 cm (Folha Inteira Meio-Corte)', widthMm: 660, heightMm: 960 },
  { name: '64 x 88 cm (Formato Padrão Offset)', widthMm: 640, heightMm: 880 },
  { name: '48 x 66 cm (Meia Folha)', widthMm: 480, heightMm: 660 },
  { name: '33 x 48 cm (Digital SRA3+)', widthMm: 330, heightMm: 480 },
  { name: '31 x 46 cm (Digital Laser A3)', widthMm: 310, heightMm: 460 }
];

const FINISHES_AVAILABLE = [
  { id: 'refile', name: 'Refile / Esquadro em Guilhotina', baseCost: 15.00, perThousandCost: 5.00 },
  { id: 'bopp_fosco', name: 'Laminação BOPP Fosco', baseCost: 35.00, perThousandCost: 45.00 },
  { id: 'bopp_brilho', name: 'Laminação BOPP Brilho', baseCost: 30.00, perThousandCost: 40.00 },
  { id: 'verniz_localizado', name: 'Verniz UV Localizado com Reserva', baseCost: 75.00, perThousandCost: 60.00 },
  { id: 'verniz_total', name: 'Verniz UV Total / Máquina', baseCost: 40.00, perThousandCost: 25.00 },
  { id: 'dobra_1', name: '1 Dobra (Díptico)', baseCost: 25.00, perThousandCost: 15.00 },
  { id: 'dobra_2', name: '2 Dobras (Trifólio / Sanfona)', baseCost: 35.00, perThousandCost: 22.00 },
  { id: 'corte_vinco', name: 'Faca Especial de Corte e Vinco', baseCost: 110.00, perThousandCost: 35.00 },
  { id: 'colagem_bolsa', name: 'Montagem e Colagem de Bolsa', baseCost: 45.00, perThousandCost: 55.00 },
  { id: 'blocagem_cola', name: 'Blocagem com Cola Vermelha e Papelão', baseCost: 20.00, perThousandCost: 30.00 },
  { id: 'numeracao', name: 'Numeração Sequencial Tipográfica', baseCost: 40.00, perThousandCost: 20.00 }
];

export const AdminBudgetCalculatorTab: React.FC = () => {
  // Client & Job Info
  const [customerName, setCustomerName] = useState('Cliente Balcão / Revendedor');
  const [customerPhone, setCustomerPhone] = useState('(11) 99999-9999');
  const [jobName, setJobName] = useState('Cartões de Visita Executivos');
  const [targetQuantity, setTargetQuantity] = useState(1000);
  
  // Dimensions & Utilization
  const [finalWidthMm, setFinalWidthMm] = useState(90);
  const [finalHeightMm, setFinalHeightMm] = useState(50);
  const [sheetFormatIdx, setSheetFormatIdx] = useState(0); // 66x96
  
  // Paper & Colors
  const [selectedPaperName, setSelectedPaperName] = useState('Couché 300g');
  const [colorMode, setColorMode] = useState<'4x0' | '4x4' | '1x0' | '1x1' | '4x1'>('4x4');
  const [costPerCtpPlate, setCostPerCtpPlate] = useState(28.00);
  
  // Finishes
  const [selectedFinishes, setSelectedFinishes] = useState<string[]>(['bopp_fosco', 'verniz_localizado', 'refile']);
  
  // Pricing Strategy
  const [markupPercent, setMarkupPercent] = useState(85); // 85% lucro bruto
  const [deliveryDays, setDeliveryDays] = useState(2);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<GraphicBudgetEstimate[]>([]);

  // Apply Preset
  const handleApplyPreset = (preset: PresetJob) => {
    setJobName(preset.name);
    setFinalWidthMm(preset.widthMm);
    setFinalHeightMm(preset.heightMm);
    setSelectedPaperName(preset.defaultPaper);
    setColorMode(preset.defaultColors);
    setSelectedFinishes(preset.defaultFinishes);
  };

  // Calculations
  const calculations = useMemo(() => {
    const sheet = SHEET_FORMATS[sheetFormatIdx];
    const paper = PAPERS_CATALOG.find(p => p.name === selectedPaperName) || PAPERS_CATALOG[4];
    
    // Cutting calculations (Aproveitamento na folha)
    // Account for 3mm bleed + 2mm trim margin = 5mm margin per piece
    const pieceWidthWithBleed = finalWidthMm + 4;
    const pieceHeightWithBleed = finalHeightMm + 4;
    
    // Normal orientation
    const posesHorizontal = Math.floor((sheet.widthMm - 20) / pieceWidthWithBleed) * Math.floor((sheet.heightMm - 20) / pieceHeightWithBleed);
    // Inverted orientation
    const posesVertical = Math.floor((sheet.widthMm - 20) / pieceHeightWithBleed) * Math.floor((sheet.heightMm - 20) / pieceWidthWithBleed);
    const posesPerSheet = Math.max(1, Math.max(posesHorizontal, posesVertical));
    
    // Sheets needed for the run
    const netSheets = Math.ceil(targetQuantity / posesPerSheet);
    
    // Waste / Acerto de máquina
    // Offset standard: 50 to 150 sheets for setup, digital: 5 to 10 sheets
    const isDigital = sheet.name.includes('Digital');
    const wasteSheets = isDigital ? Math.max(5, Math.ceil(netSheets * 0.05)) : Math.max(50, Math.ceil(netSheets * 0.08));
    const totalSheets = netSheets + wasteSheets;
    
    // Paper Cost (500 sheets per resma)
    const resmasNeeded = totalSheets / 500;
    const costPaper = resmasNeeded * paper.pricePerResma;
    
    // CTP Plates calculation
    let ctpPlatesCount = 0;
    if (colorMode === '4x0') ctpPlatesCount = 4;
    else if (colorMode === '4x4') ctpPlatesCount = 8;
    else if (colorMode === '1x0') ctpPlatesCount = 1;
    else if (colorMode === '1x1') ctpPlatesCount = 2;
    else if (colorMode === '4x1') ctpPlatesCount = 5;
    
    const costCtp = isDigital ? 0 : ctpPlatesCount * costPerCtpPlate;
    
    // Printing Machine Cost (Offset setup + milhagem, or Digital click)
    let costPrinting = 0;
    if (isDigital) {
      const clickRate = colorMode.includes('4') ? 0.45 : 0.12;
      costPrinting = totalSheets * clickRate * (colorMode === '4x4' || colorMode === '1x1' ? 2 : 1);
    } else {
      const machinePerHour = 95.00;
      const setupTimeHours = 0.5 * (ctpPlatesCount / 4);
      const runSpeedPerHour = 4000;
      const runTimeHours = totalSheets / runSpeedPerHour;
      costPrinting = (setupTimeHours + runTimeHours) * machinePerHour;
    }
    
    // Finishes Cost
    let costFinishing = 0;
    selectedFinishes.forEach(fId => {
      const fin = FINISHES_AVAILABLE.find(f => f.id === fId);
      if (fin) {
        costFinishing += fin.baseCost + (targetQuantity / 1000) * fin.perThousandCost;
      }
    });
    
    // Total Production Cost
    const costTotal = costPaper + costCtp + costPrinting + costFinishing;
    const unitCost = costTotal / targetQuantity;
    
    // Sale Price based on markup
    const suggestedSalePrice = costTotal * (1 + markupPercent / 100);
    const unitPrice = suggestedSalePrice / targetQuantity;
    const grossProfit = suggestedSalePrice - costTotal;
    const grossMarginPercent = (grossProfit / suggestedSalePrice) * 100;

    return {
      posesPerSheet,
      netSheets,
      wasteSheets,
      totalSheets,
      costPaper,
      ctpPlatesCount,
      costCtp,
      costPrinting,
      costFinishing,
      costTotal,
      unitCost,
      suggestedSalePrice,
      unitPrice,
      grossProfit,
      grossMarginPercent,
      sheetName: sheet.name,
      paperName: paper.name
    };
  }, [
    finalWidthMm, 
    finalHeightMm, 
    sheetFormatIdx, 
    selectedPaperName, 
    targetQuantity, 
    colorMode, 
    costPerCtpPlate, 
    selectedFinishes, 
    markupPercent
  ]);

  // Copy WhatsApp Proposal
  const handleCopyWhatsApp = () => {
    const finishesText = selectedFinishes
      .map(id => FINISHES_AVAILABLE.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    const text = `📋 *PROPOSTA DE ORÇAMENTO GRÁFICO TÉCNICO*
*Silk Print Indústria Gráfica*

👤 *Cliente:* ${customerName}
📦 *Material:* ${jobName}
🔢 *Tiragem:* ${targetQuantity.toLocaleString('pt-BR')} unidades
📐 *Formato Final:* ${finalWidthMm} x ${finalHeightMm} mm
📄 *Papel:* ${selectedPaperName}
🎨 *Cores:* ${colorMode} (${colorMode === '4x4' ? 'Colorido Frente e Verso' : colorMode === '4x0' ? 'Colorido Apenas Frente' : 'Monocromático'})
✨ *Acabamentos:* ${finishesText || 'Refile Padrão'}
⏱️ *Prazo de Produção:* ${deliveryDays} ${deliveryDays === 1 ? 'dia útil' : 'dias úteis'}

💰 *VALOR TOTAL:* ${formatCurrency(calculations.suggestedSalePrice)}
🏷️ *Unitário:* ${formatCurrency(calculations.unitPrice)} / un

💳 *Condições de Pagamento:* PIX com 5% de desconto ou até 3x no Cartão de Crédito.
⚠️ *Validade da Proposta:* 7 dias corridos.

Deseja aprovar e dar entrada na produção?`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveQuote = () => {
    const newQuote: GraphicBudgetEstimate = {
      id: `ORC-${Date.now().toString().slice(-5)}`,
      customerName,
      jobName,
      paperType: selectedPaperName,
      paperWeight: selectedPaperName.match(/\d+g/)?.[0] || '150g',
      sheetFormat: calculations.sheetName,
      finalFormat: `${finalWidthMm}x${finalHeightMm} mm`,
      posesPerSheet: calculations.posesPerSheet,
      printColors: colorMode,
      quantity: targetQuantity,
      sheetsNeeded: calculations.netSheets,
      wasteSheets: calculations.wasteSheets,
      totalSheets: calculations.totalSheets,
      ctpPlatesCount: calculations.ctpPlatesCount,
      costPaper: calculations.costPaper,
      costCtp: calculations.costCtp,
      costPrinting: calculations.costPrinting,
      costFinishing: calculations.costFinishing,
      costTotal: calculations.costTotal,
      markupPercent,
      suggestedSalePrice: calculations.suggestedSalePrice,
      unitPrice: calculations.unitPrice,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    setSavedQuotes(prev => [newQuote, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" /> Calculadora Técnica de Orçamentos Gráficos
          </h2>
          <p className="text-xs text-slate-400">
            Engenharia de custos para produção Offset e Digital: aproveitamento de folha, chapas CTP, insumos e margem
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            {copiedSuccess ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSuccess ? 'Copiado para WhatsApp!' : 'Copiar p/ WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Modelos Rápidos de Materiais Gráficos:
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_JOBS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/60"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Inputs vs Financial Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Configurations (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Identification */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> 1. Identificação do Trabalho & Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Material / Job</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tiragem Desejada (Unidades)</label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  value={targetQuantity}
                  onChange={(e) => setTargetQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Prazo Prometido (Dias Úteis)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Formatos & Aproveitamento Técnico */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> 2. Formatos & Engenharia de Corte
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Largura Corte (mm)</label>
                <input
                  type="number"
                  value={finalWidthMm}
                  onChange={(e) => setFinalWidthMm(Math.max(10, parseInt(e.target.value, 10) || 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Altura Corte (mm)</label>
                <input
                  type="number"
                  value={finalHeightMm}
                  onChange={(e) => setFinalHeightMm(Math.max(10, parseInt(e.target.value, 10) || 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Folha de Impressão</label>
                <select
                  value={sheetFormatIdx}
                  onChange={(e) => setSheetFormatIdx(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 truncate"
                >
                  {SHEET_FORMATS.map((f, idx) => (
                    <option key={f.name} value={idx}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aproveitamento Visual Banner */}
            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-cyan-300 font-bold block">Aproveitamento Calculado na Folha:</span>
                <p className="text-slate-300 text-[11px]">
                  Cabem <strong>{calculations.posesPerSheet} poses</strong> por folha gráfica com sangria de 3mm.
                </p>
              </div>
              <div className="text-right font-mono">
                <div className="text-base font-black text-cyan-400">{calculations.posesPerSheet} Poses</div>
                <div className="text-[10px] text-slate-400">{calculations.netSheets} fls + {calculations.wasteSheets} acerto</div>
              </div>
            </div>
          </div>

          {/* Section 3: Papel & Cores de Impressão */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4" /> 3. Papel, Cores & Chapas CTP
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Papel</label>
                <select
                  value={selectedPaperName}
                  onChange={(e) => setSelectedPaperName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {PAPERS_CATALOG.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} — ({formatCurrency(p.pricePerResma)} / resma)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cores de Impressão</label>
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="4x4">4x4 (Colorido Frente e Verso - 8 chapas)</option>
                  <option value="4x0">4x0 (Colorido Frente / Verso Branco - 4 chapas)</option>
                  <option value="4x1">4x1 (Colorido Frente / Preto Verso - 5 chapas)</option>
                  <option value="1x1">1x1 (Preto Frente e Verso - 2 chapas)</option>
                  <option value="1x0">1x0 (Preto Frente / Verso Branco - 1 chapa)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Acabamentos */}
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 4. Acabamentos & Beneficiamentos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FINISHES_AVAILABLE.map((fin) => {
                const isSelected = selectedFinishes.includes(fin.id);
                return (
                  <button
                    key={fin.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedFinishes(prev => prev.filter(x => x !== fin.id));
                      } else {
                        setSelectedFinishes(prev => [...prev, fin.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border ${
                      isSelected ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{fin.name}</div>
                      <div className="text-[10px] text-slate-500">
                        Acerto {formatCurrency(fin.baseCost)} + {formatCurrency(fin.perThousandCost)}/mil
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Technical Breakdown & Pricing (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Financial Card */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumo de Custos & Margem
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
                Margem: {calculations.grossMarginPercent.toFixed(1)}%
              </span>
            </div>

            {/* Price Highlight */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold">Preço de Venda Sugerido</span>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                {formatCurrency(calculations.suggestedSalePrice)}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {formatCurrency(calculations.unitPrice)} por unidade ({targetQuantity.toLocaleString('pt-BR')} un)
              </div>
            </div>

            {/* Markup Slider */}
            <div className="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-cyan-400" /> Markup / Margem de Lucro Bruto:
                </span>
                <span className="font-mono font-bold text-cyan-400">+{markupPercent}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>20% (Atacado)</span>
                <span>85% (Padrão Gráfica)</span>
                <span>200% (Varejo Rápido)</span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Papel ({calculations.totalSheets} fls c/ refugo):
                </span>
                <span className="font-mono font-bold text-white">{formatCurrency(calculations.costPaper)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Chapas CTP ({calculations.ctpPlatesCount} un):
                </span>
                <span className="font-mono font-bold text-white">{formatCurrency(calculations.costCtp)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  Impressão (Hora Máquina/Setup):
                </span>
                <span className="font-mono font-bold text-white">{formatCurrency(calculations.costPrinting)}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-800/80 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  Acabamentos & Beneficiamento:
                </span>
                <span className="font-mono font-bold text-white">{formatCurrency(calculations.costFinishing)}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-slate-700 text-xs font-bold">
                <span className="text-slate-300">CUSTO TOTAL DE PRODUÇÃO:</span>
                <span className="font-mono text-rose-400">{formatCurrency(calculations.costTotal)}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-slate-700 text-xs font-bold">
                <span className="text-emerald-400">LUCRO BRUTO ESTIMADO:</span>
                <span className="font-mono text-emerald-400">{formatCurrency(calculations.grossProfit)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                {copiedSuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSuccess ? 'Proposta Copiada para o WhatsApp!' : 'Copiar Orçamento p/ WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveQuote}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Salvar Orçamento no Histórico</span>
              </button>
            </div>

          </div>

          {/* History of Saved Quotes */}
          {savedQuotes.length > 0 && (
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Orçamentos Salvos Recentemente ({savedQuotes.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedQuotes.map((q) => (
                  <div key={q.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{q.jobName}</div>
                      <div className="text-[10px] text-slate-400">{q.customerName} • {q.quantity} un</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-emerald-400">{formatCurrency(q.suggestedSalePrice)}</div>
                      <div className="text-[9px] text-slate-500">{q.createdAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
