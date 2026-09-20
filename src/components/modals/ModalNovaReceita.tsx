import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { Transaction } from '../../types';

interface ModalNovaReceitaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const ModalNovaReceita: React.FC<ModalNovaReceitaProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('receita');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pendente');
  const [vencimento, setVencimento] = useState('2026-08-21');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTipo('receita');
      setDescricao('');
      setValor('');
      setMetodoPagamento('');
      setStatus('pendente');
      setVencimento('2026-08-21');
      setObservacoes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValor = parseFloat(valor.replace(',', '.'));
    if (!descricao.trim() || isNaN(numValor) || numValor <= 0) {
      return;
    }

    onSave({
      type: tipo,
      description: descricao.trim(),
      value: numValor,
      paymentMethod: (metodoPagamento as any) || 'PIX',
      status,
      dueDate: vencimento,
      category: 'Receitas',
      observations: observacoes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-nova-receita"
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900">
          <h3 className="text-base font-bold text-zinc-100">Nova Receita</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-blue-500 rounded-lg text-zinc-200 focus:outline-hidden"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Descrição <span className="text-blue-400">*</span>
            </label>
            <input
              type="text"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Pagamento Pedido #123"
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Valor & Método */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Valor (R$) <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Método de Pagamento
              </label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
              >
                <option value="">Selecione</option>
                <option value="PIX">PIX</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
          </div>

          {/* Status & Vencimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pago' | 'pendente')}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Recebido / Pago</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Vencimento
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={vencimento}
                  onChange={(e) => setVencimento(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Observações</label>
            <textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
