import React, { useState } from 'react';
import {
  Image as ImageIcon,
  User,
  FileText,
  LayoutGrid,
  Type,
  Palette,
  ChevronDown,
  ChevronUp,
  Upload,
  Check,
  Lock,
  RotateCcw,
  Sparkles,
  Info,
  Truck,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface AparenciaScreenProps {
  onOpenCatalogPreview: () => void;
  onOpenUpgradeModal: () => void;
}

export const AparenciaScreen: React.FC<AparenciaScreenProps> = ({
  onOpenCatalogPreview,
  onOpenUpgradeModal,
}) => {
  // Accordion toggle states
  const [openSection, setOpenSection] = useState<string | null>('cores');

  // State for Capa
  const [capaImages, setCapaImages] = useState<string[]>([]);

  // State for Logo
  const [logoImage, setLogoImage] = useState<string | null>(null);

  // State for PDF Info
  const [pdfNome, setPdfNome] = useState('Silk Print Grafica');
  const [pdfTelefone, setPdfTelefone] = useState('(51) 93618-7210');
  const [pdfEndereco, setPdfEndereco] = useState('Av. Principal, 1200 - Centro, São Paulo - SP');
  const [pdfCnpj, setPdfCnpj] = useState('12.345.678/0001-90');
  const [pdfEmail, setPdfEmail] = useState('contato@silkprint.com.br');
  const [pdfPix, setPdfPix] = useState('51936187210 (Celular)');

  // State for Theme
  const [selectedTheme, setSelectedTheme] = useState<'lista' | 'cards' | 'vitrine'>('cards');

  // State for Rodapé
  const [textoEntrega, setTextoEntrega] = useState('Entregamos para todo o Brasil');
  const [textoWhatsApp, setTextoWhatsApp] = useState('Entre em contato pelo WhatsApp para fazer seu pedido!');
  const [bannerTitulo, setBannerTitulo] = useState('✨ A ARTE É PERSONALIZADA DO JEITINHO QUE DESEJAR!');
  const [bannerTexto, setBannerTexto] = useState(
    'Você escolhe: cores, logo, estilo, informações e o que mais desejar!\n⚠️ Os cortes são exatamente como na imagem e NÃO PODE MUDAR.\nDeseja outras tags? Monte seu kit. Nosso time irá lhe ajudar em cada detalhe.'
  );

  // State for Cores
  const [corEscuroPrincipal, setCorEscuroPrincipal] = useState('#2563eb');
  const [corEscuroDestaque, setCorEscuroDestaque] = useState('#3b82f6');
  const [corClaroPrincipal, setCorClaroPrincipal] = useState('#2563eb');
  const [corClaroDestaque, setCorClaroDestaque] = useState('#1d4ed8');

  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const triggerSaveNotification = (msg: string) => {
    setSavedSuccessMessage(msg);
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  const toggleAccordion = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div id="screen-aparencia" className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
            Aparência
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5">
            Personalize a aparência do seu catálogo
          </p>
        </div>

        <button
          onClick={onOpenCatalogPreview}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          <span>Ver Catálogo</span>
        </button>
      </div>

      {/* Save Toast */}
      {savedSuccessMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* Accordion List */}
      <div className="space-y-4">
        {/* 1. Imagem de Capa */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-md">
          <button
            onClick={() => toggleAccordion('capa')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400">
                <ImageIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-zinc-100">Imagem de Capa</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full">
                {capaImages.length === 0 ? 'Sem imagem' : `${capaImages.length} imagens`}
              </span>
              {openSection === 'capa' ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {openSection === 'capa' && (
            <div className="p-5 md:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-5">
              {/* Drop Area */}
              <div className="border-2 border-dashed border-zinc-800 hover:border-blue-500/50 rounded-xl p-8 text-center bg-zinc-950/80 flex flex-col items-center justify-center space-y-3 transition-colors">
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-zinc-300">Nenhuma imagem de capa</p>
                <button
                  type="button"
                  onClick={() => {
                    setCapaImages(['https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200']);
                    triggerSaveNotification('Imagem de capa padrão adicionada!');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Adicionar imagem</span>
                </button>
              </div>

              {/* Guidelines Box */}
              <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-bold text-zinc-200">Slide de Imagens de Capa</h4>
                <div className="space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Você pode adicionar até 5 imagens que ficarão passando em slide automático</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Formato recomendado: 1200x400 pixels (proporção 3:1)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Formatos aceitos: PNG, JPG ou WebP (máx. 2MB cada)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Se nenhuma imagem for enviada, o catálogo usará a capa padrão</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-[11px] text-blue-400/90 font-medium">
                  💡 As imagens passam automaticamente a cada 5 segundos no topo do catálogo.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Logo da Loja */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-md">
          <button
            onClick={() => toggleAccordion('logo')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-zinc-100">Logo da Loja</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full">
                {logoImage ? 'Logo ativo' : 'Sem logo'}
              </span>
              {openSection === 'logo' ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {openSection === 'logo' && (
            <div className="p-5 md:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white text-2xl font-black flex items-center justify-center shadow-lg shrink-0">
                  S
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h4 className="text-sm font-bold text-zinc-100">Silk Print Grafica</h4>
                  <p className="text-xs text-zinc-400">
                    Kits e Cartelas Personalizadas para Semijoias
                  </p>
                  <p className="text-[11px] text-zinc-500 pt-1">
                    Formato recomendado: 500x500px, PNG com fundo transparente (máx. 2MB).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerSaveNotification('Logo atualizado com sucesso!')}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Adicionar logo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Informações do PDF */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-md">
          <button
            onClick={() => toggleAccordion('pdf')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-zinc-100">Informações do PDF</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Configurado
              </span>
              {openSection === 'pdf' ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {openSection === 'pdf' && (
            <div className="p-5 md:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4">
              <p className="text-xs text-zinc-400">
                Essas informações serão exibidas no cabeçalho dos PDFs de Pedidos e Orçamentos gerados pelo sistema.
              </p>

              {/* Logo PDF upload */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Logo para o PDF</span>
                  <span className="text-[11px] text-zinc-500">Recomendado 400x200px PNG ou WebP</span>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
                >
                  Adicionar logo
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    value={pdfNome}
                    onChange={(e) => setPdfNome(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={pdfTelefone}
                    onChange={(e) => setPdfTelefone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Endereço Completo
                  </label>
                  <input
                    type="text"
                    value={pdfEndereco}
                    onChange={(e) => setPdfEndereco(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    value={pdfCnpj}
                    onChange={(e) => setPdfCnpj(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    E-mail
                  </label>
                  <input
                    type="text"
                    value={pdfEmail}
                    onChange={(e) => setPdfEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Chave PIX (opcional)
                  </label>
                  <input
                    type="text"
                    value={pdfPix}
                    onChange={(e) => setPdfPix(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    Será exibido apenas no PDF de Pedidos (não aparece em Orçamentos).
                  </span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => triggerSaveNotification('Informações do PDF salvas!')}
                  className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-sm"
                >
                  Salvar Informações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Tema do Catálogo */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-md">
          <button
            onClick={() => toggleAccordion('tema')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-zinc-100">Tema do Catálogo</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full capitalize">
                {selectedTheme}
              </span>
              {openSection === 'tema' ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {openSection === 'tema' && (
            <div className="p-5 md:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-4">
              <p className="text-xs text-zinc-400">
                Escolha como os produtos serão organizados visualmente no catálogo:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Option: Lista */}
                <div
                  onClick={() => setSelectedTheme('lista')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTheme === 'lista'
                      ? 'bg-zinc-900 border-blue-500/60 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-200 block">Lista</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Exibe produtos em lista vertical
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    {selectedTheme === 'lista' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Option: Cards */}
                <div
                  onClick={() => setSelectedTheme('cards')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTheme === 'cards'
                      ? 'bg-zinc-900 border-blue-500/60 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-200 block">Cards</span>
                    <span className="text-[11px] text-zinc-400 block">
                      Exibe produtos em grade
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    {selectedTheme === 'cards' && (
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Option: Vitrine (PRO) */}
                <div
                  onClick={onOpenUpgradeModal}
                  className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 opacity-80 hover:opacity-100 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-300">Vitrine</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold bg-blue-500/20 text-blue-400 rounded">
                        PRO
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500 block">
                      Layout estilo loja com banner
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Texto do Rodapé */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-md">
          <button
            onClick={() => toggleAccordion('rodape')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400">
                <Type className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-zinc-100">Texto do Rodapé</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800/80 px-2.5 py-0.5 rounded-full">
                Personalizado
              </span>
              {openSection === 'rodape' ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </button>

          {openSection === 'rodape' && (
            <div className="p-5 md:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-6">
              <p className="text-xs text-zinc-400">
                Personalize as mensagens e avisos exibidos no rodapé do catálogo e no banner das categorias.
              </p>

              {/* Seção 1: Rodapé Principal */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Rodapé Principal
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-400">
                        Texto de Entrega
                      </label>
                      <span className="text-[10px] text-zinc-500">{textoEntrega.length}/100</span>
                    </div>
                    <input
                      type="text"
                      maxLength={100}
                      value={textoEntrega}
                      onChange={(e) => setTextoEntrega(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-400">
                        Texto do WhatsApp
                      </label>
                      <span className="text-[10px] text-zinc-500">{textoWhatsApp.length}/150</span>
                    </div>
                    <input
                      type="text"
                      maxLength={150}
                      value={textoWhatsApp}
                      onChange={(e) => setTextoWhatsApp(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Preview Card do Rodapé (Branco como no print) */}
                <div className="p-4 rounded-xl bg-white text-zinc-900 shadow-md space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-blue-400/20 text-blue-600">
                      <Truck className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-zinc-800">{textoEntrega}</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{textoWhatsApp}</p>
                  <button
                    type="button"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Fale conosco pelo WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTextoEntrega('Entregamos para todo o Brasil');
                      setTextoWhatsApp('Entre em contato pelo WhatsApp para fazer seu pedido!');
                      triggerSaveNotification('Rodapé restaurado para o padrão!');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar padrão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerSaveNotification('Rodapé salvo com sucesso!')}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                  >
                    Salvar rodapé
                  </button>
                </div>
              </div>

              {/* Seção 2: Banner das Categorias */}
              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Banner das Categorias
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-400">
                        Título (texto em destaque)
                      </label>
                      <span className="text-[10px] text-zinc-500">{bannerTitulo.length}/100</span>
                    </div>
                    <input
                      type="text"
                      maxLength={100}
                      value={bannerTitulo}
                      onChange={(e) => setBannerTitulo(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-400">
                        Texto personalizado
                      </label>
                      <span className="text-[10px] text-zinc-500">{bannerTexto.length}/500</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      value={bannerTexto}
                      onChange={(e) => setBannerTexto(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Preview Banner Branco */}
                <div className="p-4 rounded-xl bg-white text-zinc-900 shadow-md border-l-4 border-blue-500 space-y-1.5">
                  <h5 className="text-xs font-black text-blue-600 tracking-tight">
                    {bannerTitulo}
                  </h5>
                  <p className="text-xs text-zinc-700 whitespace-pre-line leading-relaxed font-medium">
                    {bannerTexto}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setBannerTitulo('✨ A ARTE É PERSONALIZADA DO JEITINHO QUE DESEJAR!');
                      setBannerTexto(
                        'Você escolhe: cores, logo, estilo, informações e o que mais desejar!\n⚠️ Os cortes são exatamente como na imagem e NÃO PODE MUDAR.\nDeseja outras tags? Monte seu kit. Nosso time irá lhe ajudar em cada detalhe.'
                      );
                      triggerSaveNotification('Banner restaurado para o padrão!');
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar padrão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerSaveNotification('Banner de categorias salvo!')}
                    className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
                  >
                    Salvar banner
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Cores do Catálogo */}
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-md">
          <button
            onClick={() => toggleAccordion('cores')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-800/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-blue-400">
                <Palette className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-zinc-100">Cores do Catálogo</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-700" style={{ backgroundColor: corEscuroPrincipal }} />
              <span className="w-3.5 h-3.5 rounded-full border border-zinc-700" style={{ backgroundColor: corClaroPrincipal }} />
              {openSection === 'cores' ? (
                <ChevronUp className="w-4 h-4 text-zinc-400 ml-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400 ml-1" />
              )}
            </div>
          </button>

          {openSection === 'cores' && (
            <div className="p-5 md:p-6 border-t border-zinc-800/80 bg-zinc-950/40 space-y-6">
              <p className="text-xs text-zinc-400">
                Defina as cores do catálogo para o modo escuro e modo claro.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Modo Escuro Config */}
                <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">Modo Escuro</span>
                    <span className="text-[10px] text-zinc-500">Dark Mode</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Cor Principal (Botões e destaques)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={corEscuroPrincipal}
                          onChange={(e) => setCorEscuroPrincipal(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={corEscuroPrincipal}
                          onChange={(e) => setCorEscuroPrincipal(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Cor de Destaque / Hover
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={corEscuroDestaque}
                          onChange={(e) => setCorEscuroDestaque(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={corEscuroDestaque}
                          onChange={(e) => setCorEscuroDestaque(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      style={{ backgroundColor: corEscuroPrincipal }}
                      className="w-full py-2 rounded-lg text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Exemplo no Modo Escuro
                    </button>
                  </div>
                </div>

                {/* Modo Claro Config */}
                <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">Modo Claro</span>
                    <span className="text-[10px] text-zinc-500">Light Mode</span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Cor Principal (Botões e destaques)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={corClaroPrincipal}
                          onChange={(e) => setCorClaroPrincipal(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={corClaroPrincipal}
                          onChange={(e) => setCorClaroPrincipal(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">
                        Cor de Destaque / Hover
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={corClaroDestaque}
                          onChange={(e) => setCorClaroDestaque(e.target.value)}
                          className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={corClaroDestaque}
                          onChange={(e) => setCorClaroDestaque(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      style={{ backgroundColor: corClaroPrincipal }}
                      className="w-full py-2 rounded-lg text-white font-bold text-xs shadow-sm transition-all"
                    >
                      Exemplo no Modo Claro
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => triggerSaveNotification('Cores do catálogo atualizadas!')}
                  className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-sm"
                >
                  Salvar Cores
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
