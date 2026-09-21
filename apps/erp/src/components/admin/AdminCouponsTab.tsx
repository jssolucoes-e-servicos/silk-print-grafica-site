import React, { useState } from 'react';
import { Coupon } from '../../types';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  X, 
  Percent, 
  Truck, 
  DollarSign, 
  ShieldCheck 
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AdminCouponsTabProps {
  coupons: Coupon[];
  onSaveCoupon: (coupon: Partial<Coupon>) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export const AdminCouponsTab: React.FC<AdminCouponsTabProps> = ({
  coupons,
  onSaveCoupon,
  onDeleteCoupon,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [freeShipping, setFreeShipping] = useState(false);
  const [minSpend, setMinSpend] = useState(0);
  const [description, setDescription] = useState('');

  const handleCopy = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenModal = () => {
    setCode('');
    setDiscountPercent(10);
    setFreeShipping(false);
    setMinSpend(0);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      setIsSaving(true);
      await onSaveCoupon({
        code: code.toUpperCase().trim(),
        discountPercent: Number(discountPercent) || 0,
        freeShipping: Boolean(freeShipping),
        minSpend: Number(minSpend) || 0,
        description: description.trim(),
        active: true
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving coupon:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    await onSaveCoupon({
      ...coupon,
      active: !coupon.active
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white font-heading flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" /> Cupons Promocionais & Descontos
          </h3>
          <p className="text-xs text-slate-400">
            Crie códigos de desconto em porcentagem ou frete grátis para campanhas de marketing
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Criar Novo Cupom
        </button>
      </div>

      {/* Cards of Coupons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
            Nenhum cupom cadastrado ainda. Clique em "Criar Novo Cupom" para criar o primeiro!
          </div>
        ) : (
          coupons.map((c) => (
            <div
              key={c.id || c.code}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                c.active !== false
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-850 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-mono font-black text-sm tracking-wider flex items-center gap-1.5">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(c.code)}
                      className="p-1.5 text-slate-500 hover:text-slate-200 rounded-lg"
                      title="Copiar código"
                    >
                      {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCouponToDelete(c)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Excluir cupom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {c.discountPercent > 0 && (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> {c.discountPercent}% OFF
                    </span>
                  )}
                  {c.freeShipping && (
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> Frete Grátis
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                  {c.description || 'Cupom de desconto especial para clientes.'}
                </p>

                {c.minSpend > 0 && (
                  <div className="text-[11px] text-slate-400 mb-2">
                    Pedido mínimo: <strong className="text-white font-mono">{formatCurrency(c.minSpend)}</strong>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(c)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    c.active !== false
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800'
                      : 'bg-slate-900 text-slate-500 border-slate-700'
                  }`}
                >
                  {c.active !== false ? '● Ativo na Loja' : '○ Desativado'}
                </button>

                <span className="text-[10px] text-slate-500">
                  {c.active !== false ? 'Clientes podem usar no checkout' : 'Pausado'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Criar Cupom */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-100">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Criar Cupom de Desconto</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PRIMEIRACOMPRA, SILK10, VIP20"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase font-mono tracking-wider focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Desconto (%)</label>
                  <div className="relative">
                    <Percent className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pedido Mínimo (R$)</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={minSpend}
                      onChange={(e) => setMinSpend(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chk-freeship"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <label htmlFor="chk-freeship" className="text-xs font-bold text-slate-200 cursor-pointer select-none flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" /> Conceder Frete Grátis com este cupom
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descrição / Regras</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: 10% de desconto na primeira compra de cartões ou panfletos."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
                >
                  {isSaving ? 'Salvando...' : 'Cadastrar Cupom'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CUPOM */}
      {couponToDelete && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Excluir Cupom</h3>
            
            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              Tem certeza que deseja excluir o cupom promocional <strong className="text-emerald-400 font-mono font-black">{couponToDelete.code}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCouponToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await onDeleteCoupon(couponToDelete.id || couponToDelete.code);
                    setCouponToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Excluir Cupom</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
