import React, { useState } from 'react';
import { PickupPoint } from '../../types';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  DollarSign, 
  Building2,
  X,
  Check,
  Edit2,
  Phone,
  User,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
  Navigation,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface AdminPickupPointsTabProps {
  pickupPoints: PickupPoint[];
  onSavePickupPoint: (point: Partial<PickupPoint>) => Promise<void>;
  onDeletePickupPoint: (id: string) => Promise<void>;
}

export const AdminPickupPointsTab: React.FC<AdminPickupPointsTabProps> = ({
  pickupPoints,
  onSavePickupPoint,
  onDeletePickupPoint,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('TODOS');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  
  // Modal states (Create & Update)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // In-app Delete Confirmation Modal (works reliably in all iframes and browsers)
  const [pointToDelete, setPointToDelete] = useState<PickupPoint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [state, setState] = useState('SP');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [openingHours, setOpeningHours] = useState('Seg a Sex: 09h às 18h');
  const [price, setPrice] = useState(0);
  const [phone, setPhone] = useState('');
  const [contactName, setContactName] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  // Brazilian states list
  const BRAZILIAN_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const statesInUse = Array.from(new Set(pickupPoints.map(p => p.state))).sort();

  const filteredPoints = pickupPoints.filter((point) => {
    const matchesSearch = 
      point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (point.neighborhood && point.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (point.cep && point.cep.includes(searchTerm));
    const matchesState = selectedState === 'TODOS' || point.state === selectedState;
    return matchesSearch && matchesState;
  });

  // KPIs
  const totalPoints = pickupPoints.length;
  const freePoints = pickupPoints.filter(p => Number(p.price) === 0).length;
  const activeCount = pickupPoints.filter(p => p.active !== false).length;

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setState('SP');
    setCity('');
    setNeighborhood('');
    setAddress('');
    setCep('');
    setOpeningHours('Seg a Sex: 09h às 18h');
    setPrice(0);
    setPhone('');
    setContactName('');
    setNotes('');
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (point: PickupPoint) => {
    setEditingId(point.id);
    setName(point.name || '');
    setState(point.state || 'SP');
    setCity(point.city || '');
    setNeighborhood(point.neighborhood || '');
    setAddress(point.address || '');
    setCep(point.cep || '');
    setOpeningHours(point.openingHours || 'Seg a Sex: 09h às 18h');
    setPrice(Number(point.price) || 0);
    setPhone(point.phone || '');
    setContactName(point.contactName || '');
    setNotes(point.notes || '');
    setActive(point.active !== false);
    setIsModalOpen(true);
  };

  const handleQuickToggleActive = async (point: PickupPoint) => {
    try {
      await onSavePickupPoint({
        ...point,
        active: point.active === false ? true : false,
      });
    } catch (err) {
      console.error('Error toggling pickup point status:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim() || !address.trim()) return;

    try {
      setIsSaving(true);
      await onSavePickupPoint({
        ...(editingId ? { id: editingId } : {}),
        name: name.trim(),
        state: state.toUpperCase().trim(),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        address: address.trim(),
        cep: cep.trim(),
        openingHours: openingHours.trim(),
        price: Number(price) || 0,
        phone: phone.trim(),
        contactName: contactName.trim(),
        notes: notes.trim(),
        active,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving pickup point:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" /> Balcões de Retirada Parceiros
          </h3>
          <p className="text-xs text-slate-400">
            CRUD completo da rede física de pontos de apoio, com taxas de frete, endereços e contatos
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizar em Tabela / Lista Moderna"
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista / Tabela</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Visualizar em Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Novo Balcão
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total de Pontos</div>
            <div className="text-lg font-black text-white font-mono">{totalPoints}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Pontos Ativos</div>
            <div className="text-lg font-black text-emerald-400 font-mono">{activeCount}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400 shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Estados (UFs)</div>
            <div className="text-lg font-black text-white font-mono">{statesInUse.length}</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Frete Grátis</div>
            <div className="text-lg font-black text-indigo-400 font-mono">{freePoints}</div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do balcão, cidade, bairro, endereço ou CEP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedState('TODOS')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              selectedState === 'TODOS'
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Todos os Estados
          </button>
          {statesInUse.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedState(st)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap font-mono ${
                selectedState === st
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE / LISTA MODERNA VIEW */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Balcão / Identificação</th>
                  <th className="py-3.5 px-4">Localização & Endereço</th>
                  <th className="py-3.5 px-4">Horários & Contato</th>
                  <th className="py-3.5 px-4 text-center">Taxa Balcão</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPoints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      Nenhum balcão encontrado para os termos buscados.
                    </td>
                  </tr>
                ) : (
                  filteredPoints.map((point) => (
                    <tr 
                      key={point.id} 
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & UF */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[11px] font-black flex items-center justify-center shrink-0">
                            {point.state}
                          </span>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                              {point.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>ID: {point.id.slice(0, 8)}</span>
                              {point.contactName && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <User className="w-3 h-3 text-slate-500" /> {point.contactName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location & Address */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-200">
                          {point.city} {point.neighborhood ? `— ${point.neighborhood}` : ''}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5" title={point.address}>
                          {point.address} {point.cep ? `• CEP: ${point.cep}` : ''}
                        </div>
                      </td>

                      {/* Hours & Phone */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-[11px]">{point.openingHours || 'Consulte'}</span>
                        </div>
                        {point.phone && (
                          <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] mt-1">
                            <Phone className="w-3 h-3 text-cyan-500" />
                            <span>{point.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Shipping price */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {Number(point.price) > 0 ? (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold text-xs">
                            {formatCurrency(point.price)}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-mono font-bold text-xs">
                            Grátis
                          </span>
                        )}
                      </td>

                      {/* Status Active/Inactive Toggle */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleQuickToggleActive(point)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all inline-flex items-center gap-1 ${
                            point.active !== false
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                              : 'bg-rose-950/60 border-rose-800 text-rose-400 hover:bg-rose-900/60'
                          }`}
                          title="Clique para alternar status do balcão"
                        >
                          {point.active !== false ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Ativo
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              Inativo
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(point)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950/80 hover:text-cyan-400 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1 border border-slate-700/60 hover:border-cyan-800"
                            title="Editar Dados do Balcão"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPointToDelete(point)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
                            title="Excluir Balcão"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPoints.length === 0 ? (
            <div className="col-span-full p-12 text-center text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800">
              Nenhum balcão encontrado para este filtro.
            </div>
          ) : (
            filteredPoints.map((point) => (
              <div
                key={point.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono text-[10px] font-black">
                        {point.state}
                      </span>
                      <h4 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors">
                        {point.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(point)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Editar balcão"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPointToDelete(point)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Excluir balcão"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 mb-1">
                    <strong className="text-white">{point.city}</strong>
                    {point.neighborhood ? ` • ${point.neighborhood}` : ''}
                  </div>

                  <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                    {point.address} {point.cep ? ` - CEP: ${point.cep}` : ''}
                  </p>

                  {point.openingHours && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{point.openingHours}</span>
                    </div>
                  )}

                  {point.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 mb-2">
                      <Phone className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      <span>{point.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Frete:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {Number(point.price) > 0 ? formatCurrency(point.price) : 'Grátis (R$ 0,00)'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickToggleActive(point)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      point.active !== false
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                        : 'bg-rose-950/60 border-rose-800 text-rose-400'
                    }`}
                  >
                    {point.active !== false ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: CRIAR OU EDITAR BALCÃO (CRUD COMPLETO) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col text-slate-100 my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingId ? 'Editar Balcão de Retirada' : 'Cadastrar Novo Balcão de Retirada'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingId ? `Editando registro ID: ${editingId}` : 'Adicione um ponto físico de coleta para seus clientes'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nome do Balcão / Empresa Parceira *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Balcão Central - Gráfica Express SP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estado (UF) *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  >
                    {BRAZILIAN_STATES.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="Centro / Vila Mariana"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="01001-000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Endereço Completo *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua da Imprensa, 120 - Sala 4, Edifício Gráfico"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Horário de Atendimento</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="Seg a Sex: 08:30 às 18:00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Taxa de Frete ao Balcão (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      placeholder="0.00 (Grátis)"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Deixe 0.00 para retirada gratuita
                  </span>
                </div>
              </div>

              {/* Extra Professional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Telefone / WhatsApp de Contato
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Responsável / Contato no Ponto
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ex: Carlos Oliveira"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Instruções ou Observações para Expedição / Cliente
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Ponto localizado dentro da papelaria; apresentar documento com foto e número da O.S."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Status Toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Status no Checkout da Loja:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-bold text-slate-300">
                    {active ? 'Balcão Ativo' : 'Balcão Oculto / Pausado'}
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {editingId ? (
                  <button
                    type="button"
                    onClick={() => {
                      const current = pickupPoints.find(p => p.id === editingId) || {
                        id: editingId,
                        name: name || 'Balcão Selecionado',
                        state: state,
                        city: city,
                        address: address,
                        price: price
                      } as PickupPoint;
                      setPointToDelete(current);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-bold border border-rose-900/50 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir Balcão</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
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
                    className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-lg shadow-cyan-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Salvando...' : editingId ? 'Atualizar Balcão' : 'Cadastrar Balcão'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (100% SEGURO PARA IFRAMES) */}
      {pointToDelete && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/50 text-rose-400 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">Excluir Balcão de Retirada</h3>
            
            <p className="text-sm text-slate-300 mb-2 leading-relaxed">
              Tem certeza que deseja remover o balcão <strong className="text-white">"{pointToDelete.name}"</strong>?
            </p>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-6 text-xs text-slate-400 space-y-1">
              <div><strong className="text-slate-300">Cidade/UF:</strong> {pointToDelete.city} - {pointToDelete.state}</div>
              {pointToDelete.address && <div><strong className="text-slate-300">Endereço:</strong> {pointToDelete.address}</div>}
              <div><strong className="text-slate-300">Valor Frete:</strong> {Number(pointToDelete.price) === 0 ? 'Grátis' : `R$ ${Number(pointToDelete.price).toFixed(2)}`}</div>
            </div>

            <p className="text-xs text-rose-400/80 mb-6">
              ⚠️ Esta ação removerá imediatamente o balcão da loja e do cálculo de frete nos novos pedidos.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPointToDelete(null)}
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
                    await onDeletePickupPoint(pointToDelete.id);
                    setPointToDelete(null);
                    setIsModalOpen(false);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removendo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sim, Excluir Balcão</span>
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
