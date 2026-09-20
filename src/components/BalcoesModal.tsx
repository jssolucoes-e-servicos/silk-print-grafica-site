import React, { useState } from 'react';
import { X, MapPin, Search, Phone, Clock, CheckCircle2, Building2 } from 'lucide-react';
import { BalcaoRetirada } from '../types';
import { formatCurrency } from '../lib/utils';

interface BalcoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupPoints?: BalcaoRetirada[];
}

export const BalcoesModal: React.FC<BalcoesModalProps> = ({ isOpen, onClose, pickupPoints = [] }) => {
  const [selectedState, setSelectedState] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const states = ['TODOS', ...Array.from(new Set(pickupPoints.map(p => p.state).filter(Boolean)))];

  const filteredBalcoes = pickupPoints.filter((b) => {
    const matchesState = selectedState === 'TODOS' || b.state === selectedState;
    const matchesSearch = searchQuery === '' || 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading">Balcões de Retirada Silk Print</h3>
              <p className="text-xs text-slate-400">Economize no frete e retire seu pedido em milhares de pontos parceiros</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Digite seu bairro, cidade ou endereço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* State Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
            <span className="text-slate-500 mr-1 text-[11px]">Estado:</span>
            {states.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedState === st
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Body list */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredBalcoes.length > 0 ? (
            filteredBalcoes.map((balcao) => (
              <div key={balcao.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">{balcao.name}</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800">
                      {balcao.state}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {balcao.address} - {balcao.neighborhood}, {balcao.city} • CEP: {balcao.cep}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{balcao.openingHours}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-cyan-700">
                    {balcao.price === 0 ? 'GRÁTIS' : formatCurrency(balcao.price)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ponto Credenciado
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              Nenhum balcão encontrado para esses filtros. Tente buscar por outro bairro ou estado.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default BalcoesModal;
