import React, { useState } from 'react';
import { X, ShoppingCart, Calendar, User, Phone, FileText } from 'lucide-react';
import { Client, Order, OrderStatus } from '../../types';
import { maskPhone } from '../../lib/utils';

interface ModalNovoPedidoProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onSave: (order: Order) => void;
}

export const ModalNovoPedido: React.FC<ModalNovoPedidoProps> = ({
  isOpen,
  onClose,
  clients,
  onSave,
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientWhatsapp, setClientWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [total, setTotal] = useState('');
  const [status, setStatus] = useState<OrderStatus>('em_aberto');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente' | 'parcial'>('pago');
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setClientWhatsapp(found.whatsapp);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTotal = parseFloat(total.replace(',', '.'));
    if (!clientName.trim() || !description.trim() || isNaN(numTotal) || numTotal <= 0) {
      alert('Preencha os campos obrigatórios com valores válidos.');
      return;
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      code: `#${orderNumber}`,
      clientId: selectedClientId || `cli-temp-${Date.now()}`,
      clientName: clientName.trim(),
      clientWhatsapp: clientWhatsapp.trim(),
      description: description.trim(),
      itemsCount: 1,
      total: numTotal,
      status,
      paymentStatus,
      deliveryDate,
      createdAt: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    };

    onSave(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="modal-novo-pedido"
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Novo Pedido de Produção
              </h3>
              <p className="text-xs text-zinc-400">
                Crie um pedido diretamente no quadro da gráfica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Quick select client or type */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Selecionar Cliente Cadastrado
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleSelectClient(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Selecionar da lista ou digitar abaixo --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.whatsapp})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Nome do Cliente <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Padaria Pão & Arte"
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                WhatsApp do Cliente
              </label>
              <input
                type="text"
                value={clientWhatsapp}
                onChange={(e) => setClientWhatsapp(maskPhone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 font-mono focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Descrição dos Produtos / Serviços <span className="text-blue-400">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 1.000 Cartões de Visita Couché 300g + 500 Adesivos Vinil"
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Valor Total (R$) <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-500 font-mono">
                  R$
                </span>
                <input
                  type="text"
                  required
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 font-mono placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Status Inicial no Quadro
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="criando_arte">🎨 Criando Arte</option>
                <option value="em_aberto">🕒 Em Aberto</option>
                <option value="em_producao">🏭 Em Produção</option>
                <option value="aguardando_retirada">📦 Aguardando Retirada</option>
                <option value="em_transporte">🚚 Em Transporte</option>
                <option value="entregue">🟢 Entregue</option>
                <option value="aguardando_pagamento">💳 Aguardando Pagamento</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Status do Pagamento
              </label>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as 'pago' | 'pendente' | 'parcial')
                }
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="pago">Totalmente Pago</option>
                <option value="parcial">Sinal Pago (50%)</option>
                <option value="pendente">Aguardando Pagamento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Previsão de Entrega
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Observações Internas da Produção
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções de acabamento, formato de arquivo, etc..."
              className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-all"
            >
              Salvar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
