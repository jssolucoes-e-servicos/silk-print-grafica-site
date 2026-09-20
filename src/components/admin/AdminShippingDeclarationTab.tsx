import React, { useState } from 'react';
import {
  Printer,
  Plus,
  Trash2,
  Building2,
  User,
  Package,
  FileCheck,
  RotateCcw,
  Sparkles,
  Search
} from 'lucide-react';
import { Order } from '../../types';

interface ItemRow {
  id: string;
  descricao: string;
  qtd: number;
  valor: number;
}

interface AdminShippingDeclarationTabProps {
  orders?: Order[];
}

export const AdminShippingDeclarationTab: React.FC<AdminShippingDeclarationTabProps> = ({
  orders = []
}) => {
  // Remetente (Silk Print Gráfica)
  const [remetenteNome, setRemetenteNome] = useState('Silk Print Indústria Gráfica & Comunicação Visual');
  const [remetenteDoc, setRemetenteDoc] = useState('12.345.678/0001-90');
  const [remetenteEndereco, setRemetenteEndereco] = useState('Av. Industrial das Artes Gráficas, 1500');
  const [remetenteCidade, setRemetenteCidade] = useState('São Paulo');
  const [remetenteUF, setRemetenteUF] = useState('SP');
  const [remetenteCEP, setRemetenteCEP] = useState('01310-100');

  // Destinatário
  const [destinatarioNome, setDestinatarioNome] = useState('Camila Torres');
  const [destinatarioDoc, setDestinatarioDoc] = useState('234.567.890-12');
  const [destinatarioEndereco, setDestinatarioEndereco] = useState('Rua das Acácias, 240, Apto 42');
  const [destinatarioCidade, setDestinatarioCidade] = useState('São Paulo');
  const [destinatarioUF, setDestinatarioUF] = useState('SP');
  const [destinatarioCEP, setDestinatarioCEP] = useState('04567-000');

  // Itens da declaração
  const [itens, setItens] = useState<ItemRow[]>([
    { id: '1', descricao: 'Material Gráfico Publicitário Impresso - Cartões de Visita', qtd: 1, valor: 89.0 },
    { id: '2', descricao: 'Banner Lona com Acabamento em Bainha e Ilhós', qtd: 1, valor: 120.0 }
  ]);
  const [pesoTotal, setPesoTotal] = useState('1.250');

  const handleAddItem = () => {
    setItens([
      ...itens,
      { id: String(Date.now()), descricao: '', qtd: 1, valor: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItens(itens.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof ItemRow, value: string | number) => {
    setItens(
      itens.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleLoadFromOrder = (order: Order) => {
    setDestinatarioNome(order.customer?.name || '');
    setDestinatarioDoc(order.customer?.document || '');
    
    if (order.shipping?.address) {
      const addr = order.shipping.address;
      setDestinatarioEndereco(`${addr.street || ''}, ${addr.number || ''} ${addr.complement || ''} - ${addr.neighborhood || ''}, ${addr.city || ''} - ${addr.state || ''}, CEP: ${addr.cep || ''}`);
    } else if (order.shipping?.balcaoName) {
      setDestinatarioEndereco(`Retirada Balcão: ${order.shipping.balcaoName}`);
    } else {
      setDestinatarioEndereco('Endereço cadastrado na OS');
    }
    
    if (order.items && order.items.length > 0) {
      setItens(
        order.items.map((it, idx) => ({
          id: String(idx + 1),
          descricao: `Material Gráfico: ${it.productName || 'Impresso Personalizado'} (${it.quantity || 1} un)`,
          qtd: 1,
          valor: it.totalPrice || 50
        }))
      );
    }
  };

  const totalQuantidade = itens.reduce((acc, it) => acc + (Number(it.qtd) || 0), 0);
  const totalValor = itens.reduce((acc, it) => acc + (Number(it.qtd) || 0) * (Number(it.valor) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="admin-shipping-declaration-tab" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-cyan-400" />
            Declaração de Conteúdo dos Correios & Transportadoras
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Geração oficial do documento padrão dos Correios / Jadlog / Loggi para despacho e postagem de encomendas.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir Declaração A4
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick load from Order */}
          {orders.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Puxar Dados de um Pedido / O.S.
              </span>
              <select
                onChange={(e) => {
                  const ord = orders.find((o) => o.id === e.target.value);
                  if (ord) handleLoadFromOrder(ord);
                }}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="">Selecione um pedido para autopreencher...</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customerName} (R$ {o.totalAmount?.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Destinatário */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Dados do Destinatário
            </span>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Nome Completo</label>
                <input
                  type="text"
                  value={destinatarioNome}
                  onChange={(e) => setDestinatarioNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={destinatarioDoc}
                    onChange={(e) => setDestinatarioDoc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">CEP</label>
                  <input
                    type="text"
                    value={destinatarioCEP}
                    onChange={(e) => setDestinatarioCEP(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-0.5">Endereço (Rua, Nº, Bairro)</label>
                <input
                  type="text"
                  value={destinatarioEndereco}
                  onChange={(e) => setDestinatarioEndereco(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-slate-400 text-[10px] mb-0.5">Cidade</label>
                  <input
                    type="text"
                    value={destinatarioCidade}
                    onChange={(e) => setDestinatarioCidade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-[10px] mb-0.5">UF</label>
                  <input
                    type="text"
                    value={destinatarioUF}
                    onChange={(e) => setDestinatarioUF(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white uppercase text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Itens discriminados */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-cyan-400" /> Discriminação de Conteúdo
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Adicionar Linha
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {itens.map((it, idx) => (
                <div key={it.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Conteúdo..."
                    value={it.descricao}
                    onChange={(e) => handleUpdateItem(it.id, 'descricao', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qtd"
                    value={it.qtd}
                    onChange={(e) => handleUpdateItem(it.id, 'qtd', Number(e.target.value))}
                    className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs text-center"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="R$"
                    value={it.valor}
                    onChange={(e) => handleUpdateItem(it.id, 'valor', Number(e.target.value))}
                    className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white text-xs text-right"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(it.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-bold">Peso Total da Caixa (Kg):</span>
              <input
                type="text"
                value={pesoTotal}
                onChange={(e) => setPesoTotal(e.target.value)}
                className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Preview Panel: The exact Correios standard A4 format */}
        <div className="lg:col-span-7 bg-white text-black p-6 rounded-2xl shadow-xl overflow-hidden font-sans text-[11px] leading-tight select-none">
          <div className="border-2 border-black p-3 space-y-3">
            {/* Title */}
            <div className="text-center font-black text-sm tracking-wide border-b-2 border-black pb-1 uppercase">
              DECLARAÇÃO DE CONTEÚDO
            </div>

            {/* Remetente & Destinatário Table */}
            <div className="border border-black divide-y divide-black">
              {/* Header */}
              <div className="grid grid-cols-2 divide-x divide-black bg-zinc-100 font-bold text-center py-1">
                <div>REMETENTE</div>
                <div>DESTINATÁRIO</div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 divide-x divide-black p-1.5 min-h-[36px]">
                <div>
                  <span className="font-bold">NOME: </span>
                  {remetenteNome}
                </div>
                <div>
                  <span className="font-bold">NOME: </span>
                  {destinatarioNome || '—'}
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-2 divide-x divide-black p-1.5 min-h-[36px]">
                <div>
                  <span className="font-bold">ENDEREÇO: </span>
                  {remetenteEndereco}
                </div>
                <div>
                  <span className="font-bold">ENDEREÇO: </span>
                  {destinatarioEndereco || '—'}
                </div>
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 divide-x divide-black p-1.5">
                <div className="grid grid-cols-3">
                  <div className="col-span-2">
                    <span className="font-bold">CIDADE: </span>
                    {remetenteCidade}
                  </div>
                  <div>
                    <span className="font-bold">UF: </span>
                    {remetenteUF}
                  </div>
                </div>

                <div className="grid grid-cols-3">
                  <div className="col-span-2">
                    <span className="font-bold">CIDADE: </span>
                    {destinatarioCidade || '—'}
                  </div>
                  <div>
                    <span className="font-bold">UF: </span>
                    {destinatarioUF || '—'}
                  </div>
                </div>
              </div>

              {/* CEP and Document */}
              <div className="grid grid-cols-2 divide-x divide-black p-1.5">
                <div className="grid grid-cols-2">
                  <div>
                    <span className="font-bold">CEP: </span>
                    {remetenteCEP}
                  </div>
                  <div>
                    <span className="font-bold">CNPJ/CPF: </span>
                    {remetenteDoc}
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div>
                    <span className="font-bold">CEP: </span>
                    {destinatarioCEP || '—'}
                  </div>
                  <div>
                    <span className="font-bold">CNPJ/CPF: </span>
                    {destinatarioDoc || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Identificação dos Bens */}
            <div className="border border-black">
              <div className="bg-zinc-100 font-bold text-center py-1 border-b border-black uppercase text-[10px]">
                IDENTIFICAÇÃO DOS BENS
              </div>

              <table className="w-full text-left text-[10px]">
                <thead className="border-b border-black font-bold">
                  <tr>
                    <th className="p-1 w-10 text-center border-r border-black">ITEM</th>
                    <th className="p-1 border-r border-black">CONTEÚDO</th>
                    <th className="p-1 w-16 text-center border-r border-black">QTD</th>
                    <th className="p-1 w-24 text-right">VALOR (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {itens.map((it, idx) => (
                    <tr key={it.id}>
                      <td className="p-1 text-center border-r border-black font-bold">{idx + 1}</td>
                      <td className="p-1 border-r border-black">{it.descricao || '—'}</td>
                      <td className="p-1 text-center border-r border-black font-bold">{it.qtd}</td>
                      <td className="p-1 text-right font-mono">{(it.qtd * it.valor).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold bg-zinc-50 border-t border-black">
                    <td colSpan={2} className="p-1 text-right border-r border-black uppercase">
                      TOTAIS
                    </td>
                    <td className="p-1 text-center border-r border-black">{totalQuantidade}</td>
                    <td className="p-1 text-right font-mono">R$ {totalValor.toFixed(2)}</td>
                  </tr>
                  <tr className="font-bold bg-zinc-50 border-t border-black">
                    <td colSpan={3} className="p-1 text-right border-r border-black uppercase">
                      PESO TOTAL (KG)
                    </td>
                    <td className="p-1 text-right font-mono">{pesoTotal} kg</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Declaração Legal */}
            <div className="border border-black p-2 space-y-1 text-[8px] text-justify leading-tight">
              <div className="font-bold text-center text-[9px] uppercase">DECLARAÇÃO</div>
              <p>
                Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei
                Complementar nº 87/1996, uma vez que não realizo, com habitualidade ou em volume que
                caracterize intuito comercial, operações de circulação de mercadoria, ainda que se
                iniciem no exterior, ou estou dispensado da emissão da nota fiscal por força da
                legislação tributária vigente, responsabilizando-me, nos termos da lei e a quem de
                direito, por informações inverídicas.
              </p>
              <p>
                Declaro ainda que não estou postando conteúdo inflamável, explosivo, causador de
                combustão espontânea, tóxico, corrosivo, gás ou qualquer outro conteúdo que constitua
                perigo, conforme o art. 13 da Lei Postal nº 6.538/78.
              </p>

              <div className="pt-4 flex justify-between items-end text-[9px]">
                <span>São Paulo, {new Date().toLocaleDateString('pt-BR')}</span>
                <div className="text-center">
                  <div className="w-48 border-t border-black pt-1">Assinatura do Remetente</div>
                </div>
              </div>
            </div>

            {/* Observação */}
            <div className="border border-black p-1 text-[7px] text-zinc-600">
              <span className="font-bold">OBSERVAÇÃO:</span> Constitui crime contra a ordem tributária
              suprimir ou reduzir tributo, ou contribuição social de qualquer acessório (Lei 8.137/90
              Art. 1º, V).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
