import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Client } from '../../types';
import { maskPhone } from '../../lib/utils';

interface ModalNovoClienteProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  mode?: 'full' | 'express';
}

export const ModalNovoCliente: React.FC<ModalNovoClienteProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = 'full',
}) => {
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [estado, setEstado] = useState('SP');
  const [cidade, setCidade] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome('');
      setWhatsapp('');
      setEmail('');
      setCpfCnpj('');
      setCep('');
      setEndereco('');
      setNumero('');
      setBairro('');
      setEstado('SP');
      setCidade('');
      setObservacoes('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(maskPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !whatsapp.trim()) {
      return;
    }

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: nome.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim() || undefined,
      cpfCnpj: cpfCnpj.trim() || undefined,
      cep: cep.trim() || undefined,
      endereco: endereco.trim() || undefined,
      numero: numero.trim() || undefined,
      bairro: bairro.trim() || undefined,
      estado: estado.trim() || undefined,
      cidade: cidade.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      ordersCount: 0,
      totalSpent: 0,
    };

    onSave(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-novo-cliente"
        className={`w-full ${
          mode === 'express' ? 'max-w-md' : 'max-w-xl'
        } bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900">
          <h3 className="text-base font-bold text-zinc-100">Novo Cliente</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Express Mode Form */}
        {mode === 'express' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nome <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-blue-500 rounded-lg text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                WhatsApp <span className="text-blue-400">*</span>
              </label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={handlePhoneChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
                className="w-full px-3.5 py-2.5 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            {/* Footer Buttons */}
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
        ) : (
          /* Full Mode Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            {/* Dados Pessoais */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-zinc-200">Dados Pessoais</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    CPF/CNPJ
                  </label>
                  <input
                    type="text"
                    value={cpfCnpj}
                    onChange={(e) => setCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-blue-500/80 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Nome <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    WhatsApp <span className="text-blue-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Dados do Endereço */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-zinc-200">Dados do Endereço</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">CEP</label>
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(e.target.value)}
                    placeholder="00000-000"
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Estado
                  </label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-zinc-200">Observações</label>
              <textarea
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-end gap-2.5">
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
        )}
      </div>
    </div>
  );
};
