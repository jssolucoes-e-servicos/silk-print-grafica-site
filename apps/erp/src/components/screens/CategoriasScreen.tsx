import React, { useState } from 'react';
import {
  FolderTree,
  FolderPlus,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  ExternalLink,
  Tag,
  Package,
  Gift,
  CreditCard,
  FileText,
  BookOpen,
  ShoppingBag,
  Printer,
  Utensils,
  Image as ImageIcon,
  Check,
  X,
  Lock,
  ArrowUp,
  ArrowDown,
  MoveRight,
} from 'lucide-react';

interface CategoriasScreenProps {
  onOpenUpgradeModal?: () => void;
  onOpenCatalogPreview: () => void;
}

export interface CategoryGroup {
  id: string;
  name: string;
  iconName: string;
  isActive: boolean;
  order: number;
  subcategories: SubCategoryItem[];
}

export interface SubCategoryItem {
  id: string;
  name: string;
  parentId: string;
  isActive: boolean;
  order: number;
  itemCount: number;
}

const INITIAL_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'cat-group-1',
    name: 'Comunicação Visual & Grandes Formatos',
    iconName: 'ImageIcon',
    isActive: true,
    order: 1,
    subcategories: [
      { id: 'sub-1-1', name: 'Banners & Lonas 440g', parentId: 'cat-group-1', isActive: true, order: 1, itemCount: 8 },
      { id: 'sub-1-2', name: 'Adesivos Vinil & Recorte', parentId: 'cat-group-1', isActive: true, order: 2, itemCount: 14 },
      { id: 'sub-1-3', name: 'Placas em ACM & PVC', parentId: 'cat-group-1', isActive: true, order: 3, itemCount: 5 },
      { id: 'sub-1-4', name: 'Faixas & Cavaletes', parentId: 'cat-group-1', isActive: true, order: 4, itemCount: 3 },
    ],
  },
  {
    id: 'cat-group-2',
    name: 'Papelaria Institucional & Comercial',
    iconName: 'FileText',
    isActive: true,
    order: 2,
    subcategories: [
      { id: 'sub-2-1', name: 'Cartões de Visita', parentId: 'cat-group-2', isActive: true, order: 1, itemCount: 12 },
      { id: 'sub-2-2', name: 'Panfletos & Flyers', parentId: 'cat-group-2', isActive: true, order: 2, itemCount: 9 },
      { id: 'sub-2-3', name: 'Pastas & Envelopes', parentId: 'cat-group-2', isActive: true, order: 3, itemCount: 4 },
      { id: 'sub-2-4', name: 'Blocos & Talões Numerados', parentId: 'cat-group-2', isActive: true, order: 4, itemCount: 6 },
    ],
  },
  {
    id: 'cat-group-3',
    name: 'Kits Promocionais & Empreendedor',
    iconName: 'Gift',
    isActive: true,
    order: 3,
    subcategories: [
      { id: 'sub-3-1', name: 'Kits para Semijoias & Bijuterias', parentId: 'cat-group-3', isActive: true, order: 1, itemCount: 7 },
      { id: 'sub-3-2', name: 'Kits Corporativos & Onboarding', parentId: 'cat-group-3', isActive: true, order: 2, itemCount: 3 },
      { id: 'sub-3-3', name: 'Kits para Eventos & Feiras', parentId: 'cat-group-3', isActive: true, order: 3, itemCount: 2 },
    ],
  },
  {
    id: 'cat-group-4',
    name: 'Embalagens & Sacolas',
    iconName: 'ShoppingBag',
    isActive: true,
    order: 4,
    subcategories: [
      { id: 'sub-4-1', name: 'Sacolas Kraft Personalizadas', parentId: 'cat-group-4', isActive: true, order: 1, itemCount: 6 },
      { id: 'sub-4-2', name: 'Caixas & Embalagens Delivery', parentId: 'cat-group-4', isActive: true, order: 2, itemCount: 4 },
      { id: 'sub-4-3', name: 'Tags & Cartelas de Acessórios', parentId: 'cat-group-4', isActive: true, order: 3, itemCount: 11 },
      { id: 'sub-4-4', name: 'Adesivos Lacre de Segurança', parentId: 'cat-group-4', isActive: true, order: 4, itemCount: 5 },
    ],
  },
  {
    id: 'cat-group-5',
    name: 'Brindes, Silk & Têxtil',
    iconName: 'Sparkles',
    isActive: true,
    order: 5,
    subcategories: [
      { id: 'sub-5-1', name: 'Camisetas & Bonés Personalizados', parentId: 'cat-group-5', isActive: true, order: 1, itemCount: 5 },
      { id: 'sub-5-2', name: 'Canecas & Copos Térmicos', parentId: 'cat-group-5', isActive: true, order: 2, itemCount: 8 },
      { id: 'sub-5-3', name: 'Agendas, Cadernos & Calendários', parentId: 'cat-group-5', isActive: true, order: 3, itemCount: 4 },
    ],
  },
];

export const CategoriasScreen: React.FC<CategoriasScreenProps> = ({
  onOpenUpgradeModal,
  onOpenCatalogPreview,
}) => {
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>(INITIAL_CATEGORY_GROUPS);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'cat-group-1': true,
    'cat-group-2': true,
    'cat-group-3': true,
    'cat-group-4': true,
    'cat-group-5': true,
  });

  // Modal State for New / Edit Category or Subcategory
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'parent' | 'subcategory'>('subcategory');
  const [selectedParentId, setSelectedParentId] = useState<string>('cat-group-1');
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleOpenAddSubcategory = (parentId?: string) => {
    setModalType('subcategory');
    setEditingId(null);
    setCategoryName('');
    if (parentId) setSelectedParentId(parentId);
    else if (categoryGroups.length > 0) setSelectedParentId(categoryGroups[0].id);
    setIsModalOpen(true);
  };

  const handleOpenAddParent = () => {
    setModalType('parent');
    setEditingId(null);
    setCategoryName('');
    setIsModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (modalType === 'parent') {
      if (editingId) {
        setCategoryGroups((prev) =>
          prev.map((g) => (g.id === editingId ? { ...g, name: categoryName.trim() } : g))
        );
      } else {
        const newGroup: CategoryGroup = {
          id: `cat-group-${Date.now()}`,
          name: categoryName.trim(),
          iconName: 'FolderTree',
          isActive: true,
          order: categoryGroups.length + 1,
          subcategories: [],
        };
        setCategoryGroups((prev) => [...prev, newGroup]);
        setExpandedGroups((prev) => ({ ...prev, [newGroup.id]: true }));
      }
    } else {
      // Subcategory
      if (editingId) {
        setCategoryGroups((prev) =>
          prev.map((group) => ({
            ...group,
            subcategories: group.subcategories.map((sub) =>
              sub.id === editingId ? { ...sub, name: categoryName.trim() } : sub
            ),
          }))
        );
      } else {
        const newSub: SubCategoryItem = {
          id: `sub-${Date.now()}`,
          name: categoryName.trim(),
          parentId: selectedParentId,
          isActive: true,
          order: 99,
          itemCount: 0,
        };
        setCategoryGroups((prev) =>
          prev.map((group) =>
            group.id === selectedParentId
              ? { ...group, subcategories: [...group.subcategories, newSub] }
              : group
          )
        );
        setExpandedGroups((prev) => ({ ...prev, [selectedParentId]: true }));
      }
    }

    setIsModalOpen(false);
    setCategoryName('');
    setEditingId(null);
  };

  const handleDeleteSubcategory = (groupId: string, subId: string) => {
    if (!confirm('Deseja excluir esta subcategoria?')) return;
    setCategoryGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, subcategories: g.subcategories.filter((s) => s.id !== subId) }
          : g
      )
    );
  };

  const handleDeleteParent = (groupId: string) => {
    if (!confirm('Deseja excluir esta categoria principal e suas subcategorias?')) return;
    setCategoryGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const toggleSubcategoryStatus = (groupId: string, subId: string) => {
    setCategoryGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              subcategories: g.subcategories.map((s) =>
                s.id === subId ? { ...s, isActive: !s.isActive } : s
              ),
            }
          : g
      )
    );
  };

  const toggleGroupStatus = (groupId: string) => {
    setCategoryGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, isActive: !g.isActive } : g))
    );
  };

  const totalSubcategories = categoryGroups.reduce((acc, g) => acc + g.subcategories.length, 0);

  return (
    <div id="screen-categorias-hierarquicas" className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
            Categorias & Subcategorias
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-0.5 max-w-2xl leading-relaxed">
            Organize seu catálogo em categorias principais e subcategorias encadeadas para facilitar a navegação do cliente
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={onOpenCatalogPreview}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Ver Catálogo</span>
          </button>

          <button
            onClick={() => handleOpenAddSubcategory()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nova Subcategoria</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-zinc-400">Categorias Principais</div>
            <div className="text-lg font-bold text-zinc-100 font-mono mt-0.5">{categoryGroups.length} grupos</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FolderTree className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-zinc-400">Subcategorias Ativas</div>
            <div className="text-lg font-bold text-zinc-100 font-mono mt-0.5">{totalSubcategories} itens</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Tag className="w-4 h-4" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-zinc-400">Criar Novo Grupo</div>
            <button
              onClick={handleOpenAddParent}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Categoria Principal</span>
            </button>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Hierarchical Categories Tree List */}
      <div className="space-y-4">
        {categoryGroups.map((group, groupIndex) => {
          const isExpanded = expandedGroups[group.id] !== false;

          return (
            <div
              key={group.id}
              className="rounded-2xl bg-zinc-900/90 border border-zinc-800/90 overflow-hidden shadow-sm transition-all"
            >
              {/* Parent Category Header Row */}
              <div className="p-4 bg-zinc-950/80 border-b border-zinc-800/70 flex items-center justify-between gap-3">
                <div
                  onClick={() => toggleGroupExpand(group.id)}
                  className="flex items-center gap-3 min-w-0 cursor-pointer flex-1 select-none"
                >
                  <button
                    type="button"
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                  >
                    <ChevronRight
                      className={`w-4 h-4 text-blue-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                    <FolderTree className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-100 truncate">
                        {group.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
                        {group.subcategories.length} subcategorias
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parent Row Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenAddSubcategory(group.id)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-blue-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Adicionar subcategoria neste grupo"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Adicionar Sub</span>
                  </button>

                  <button
                    onClick={() => {
                      setModalType('parent');
                      setEditingId(group.id);
                      setCategoryName(group.name);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Renomear Categoria Principal"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteParent(group.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Excluir Grupo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Nested Subcategories List */}
              {isExpanded && (
                <div className="p-3 sm:p-4 space-y-2 bg-zinc-900/40">
                  {group.subcategories.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                      <p className="text-xs text-zinc-500">
                        Nenhuma subcategoria vinculada a este grupo.
                      </p>
                      <button
                        onClick={() => handleOpenAddSubcategory(group.id)}
                        className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Adicionar primeira subcategoria</span>
                      </button>
                    </div>
                  ) : (
                    group.subcategories.map((sub, sIdx) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/70 hover:border-zinc-700/80 transition-colors group"
                      >
                        {/* Subcategory Tree Visual Line & Title */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-zinc-600 font-mono text-xs select-none">
                            ↳
                          </span>
                          <div className="w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 group-hover:text-blue-400 transition-colors">
                            <Tag className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-zinc-100">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            ({sub.itemCount} produtos)
                          </span>
                        </div>

                        {/* Subcategory Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSubcategoryStatus(group.id, sub.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              sub.isActive
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {sub.isActive ? 'Ativa' : 'Oculta'}
                          </button>

                          <button
                            onClick={() => {
                              setModalType('subcategory');
                              setEditingId(sub.id);
                              setSelectedParentId(group.id);
                              setCategoryName(sub.name);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                            title="Editar subcategoria"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleDeleteSubcategory(group.id, sub.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                            title="Excluir subcategoria"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Categoria / Subcategoria */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-100">
                {editingId
                  ? modalType === 'parent'
                    ? 'Editar Categoria Principal'
                    : 'Editar Subcategoria'
                  : modalType === 'parent'
                  ? 'Nova Categoria Principal'
                  : 'Nova Subcategoria'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              {/* Type Switcher if creating new */}
              {!editingId && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setModalType('subcategory')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      modalType === 'subcategory'
                        ? 'bg-zinc-800 text-blue-400 shadow-xs border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Subcategoria
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalType('parent')}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                      modalType === 'parent'
                        ? 'bg-zinc-800 text-blue-400 shadow-xs border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Categoria Principal
                  </button>
                </div>
              )}

              {/* If Subcategory: Select Parent Category */}
              {modalType === 'subcategory' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Categoria Pai (Grupo de Pertencimento)
                  </label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  >
                    {categoryGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {modalType === 'parent' ? 'Nome da Categoria Principal' : 'Nome da Subcategoria'}
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder={
                    modalType === 'parent'
                      ? 'Ex: Comunicação Visual & Grandes Formatos'
                      : 'Ex: Banners em Lona 440g'
                  }
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
