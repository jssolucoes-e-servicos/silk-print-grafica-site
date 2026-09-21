import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Paperclip,
  Smile,
  ExternalLink,
  RefreshCw,
  Zap,
  Info,
  ShieldCheck,
  FileText,
  Package,
  DollarSign,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { WhatsAppChatMessage, EvolutionConfig } from '../../types';
import {
  getEvolutionConfig,
  getChatMessagesForPhone,
  sendEvolutionTextMessage,
  formatToWhatsAppJid,
} from '../../lib/evolutionApi';
import confetti from 'canvas-confetti';

interface ModalWhatsAppChatProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientPhone: string;
  initialMessage?: string;
  orderCode?: string;
  quoteNumber?: string;
  onNavigateToIntegracoes?: () => void;
}

export const ModalWhatsAppChat: React.FC<ModalWhatsAppChatProps> = ({
  isOpen,
  onClose,
  clientName,
  clientPhone,
  initialMessage = '',
  orderCode,
  quoteNumber,
  onNavigateToIntegracoes,
}) => {
  const [messages, setMessages] = useState<WhatsAppChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialMessage);
  const [isSending, setIsSending] = useState(false);
  const [config, setConfig] = useState<EvolutionConfig>(getEvolutionConfig());
  const [showTemplates, setShowTemplates] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const cleanPhone = formatToWhatsAppJid(clientPhone);
  const firstName = clientName ? clientName.split(' ')[0] : 'Cliente';

  // Load chat messages and update initial message
  useEffect(() => {
    if (isOpen && clientPhone) {
      const currentConfig = getEvolutionConfig();
      setConfig(currentConfig);
      const chatHistory = getChatMessagesForPhone(clientPhone);
      setMessages(chatHistory);
      setSendError(null);

      if (initialMessage) {
        setInputText(initialMessage);
      }
    }
  }, [isOpen, clientPhone, initialMessage]);

  // Scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    setIsSending(true);
    setSendError(null);

    try {
      const result = await sendEvolutionTextMessage(
        config,
        clientPhone,
        textToSend,
        {
          clientName,
          orderCode,
          quoteNumber,
        }
      );

      setMessages((prev) => [...prev, result.message]);
      setInputText('');
      setShowTemplates(false);

      if (result.success && !result.error) {
        confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
      } else if (result.error) {
        setSendError(result.error);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      setSendError(err?.message || 'Falha de comunicação ao enviar mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  const handleApplyTemplate = (type: 'orcamento' | 'arte' | 'producao' | 'pronto' | 'pix' | 'saudacao') => {
    let msg = '';
    switch (type) {
      case 'orcamento':
        msg = `Olá, *${firstName}*! 📋 Segue o orçamento ${quoteNumber ? `*${quoteNumber}*` : ''} da *Silk Print Gráfica*. Qualquer dúvida ou alteração, estou à disposição para te atender!`;
        break;
      case 'arte':
        msg = `Olá, *${firstName}*! 🎨 A prévia da arte do pedido ${orderCode ? `*${orderCode}*` : ''} está pronta para sua aprovação. Pode conferir os detalhes e nos dar o retorno?`;
        break;
      case 'producao':
        msg = `Olá, *${firstName}*! ⚙️ O seu pedido ${orderCode ? `*${orderCode}*` : ''} entrou na linha de produção da *Silk Print Gráfica*. Avisaremos assim que estiver pronto para entrega/retirada!`;
        break;
      case 'pronto':
        msg = `Olá, *${firstName}*! 📦 Notícia boa! Seu pedido ${orderCode ? `*${orderCode}*` : ''} está finalizado e pronto para retirada em nosso balcão.`;
        break;
      case 'pix':
        msg = `Olá, *${firstName}*! 💳 Segue a nossa chave PIX para pagamento referente ao pedido ${orderCode ? `*${orderCode}*` : ''}:\n\n*Chave PIX:* 11.234.567/0001-89 (CNPJ)\n*Titular:* Silk Print Gráfica Digital`;
        break;
      case 'saudacao':
        msg = `Olá, *${firstName}*! 👋 Tudo bem? Aqui é da equipe de atendimento da *Silk Print Gráfica*. Como podemos te ajudar hoje?`;
        break;
    }
    setInputText(msg);
    setShowTemplates(false);
  };

  // Direct Web WhatsApp fallback
  const handleOpenDirectWhatsApp = () => {
    const encoded = encodeURIComponent(inputText || `Olá ${firstName}!`);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
              {clientName ? clientName.charAt(0).toUpperCase() : 'W'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100 truncate">{clientName || 'Cliente'}</h3>
                {orderCode && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    {orderCode}
                  </span>
                )}
                {quoteNumber && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono">
                    {quoteNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                <span className="font-mono text-[11px] text-zinc-300">{clientPhone || 'Sem telefone'}</span>
                <span className="text-zinc-600">•</span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Evolution API ({config.instanceName})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenDirectWhatsApp}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
              title="Abrir no WhatsApp Web"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Integration Status Banner */}
        <div className={`px-4 py-2 border-b flex items-center justify-between text-[11px] ${
          config.status === 'open'
            ? 'bg-emerald-950/20 border-emerald-900/30 text-zinc-300'
            : 'bg-amber-950/20 border-amber-900/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              config.status === 'open' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span>
              {config.status === 'open'
                ? `VPS Evolution API ativa (Instância: ${config.instanceName})`
                : config.apiUrl
                ? `Evolution API desconectada ou não testada (${config.instanceName})`
                : 'Evolution API não configurada'}
            </span>
          </div>
          {onNavigateToIntegracoes && (
            <button
              onClick={() => {
                onClose();
                onNavigateToIntegracoes();
              }}
              className="text-zinc-400 hover:text-emerald-400 underline transition-colors"
            >
              Configurar Integrações
            </button>
          )}
        </div>

        {/* Send Error Alert */}
        {sendError && (
          <div className="px-4 py-2.5 bg-rose-950/60 border-b border-rose-900/60 flex items-center justify-between gap-3 text-xs text-rose-200 animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold shrink-0">⚠️ Erro na VPS:</span>
              <span className="truncate">{sendError}</span>
            </div>
            <button
              type="button"
              onClick={handleOpenDirectWhatsApp}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Enviar via Web</span>
            </button>
          </div>
        )}

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/90 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-500">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-300">Nenhuma mensagem anterior</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs">
                  Inicie a conversa com {firstName} enviando uma mensagem manual ou selecione um modelo pronto abaixo.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.fromMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
                    msg.fromMe
                      ? 'bg-emerald-700/80 text-emerald-50 rounded-br-none border border-emerald-600/50'
                      : 'bg-zinc-800 text-zinc-100 rounded-bl-none border border-zinc-700/70'
                  }`}
                >
                  <p className="whitespace-pre-wrap select-text">{msg.text}</p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      msg.fromMe ? 'text-emerald-200/80' : 'text-zinc-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.fromMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Templates Drawer */}
        {showTemplates && (
          <div className="p-3 bg-zinc-900 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-2 animate-in slide-in-from-bottom duration-150">
            <button
              onClick={() => handleApplyTemplate('orcamento')}
              className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Envio de Orçamento</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('arte')}
              className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Aprovação de Arte</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('producao')}
              className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors flex items-center gap-2"
            >
              <Package className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate">Em Produção</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('pronto')}
              className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Pronto p/ Retirada</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('pix')}
              className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors flex items-center gap-2"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Chave PIX / Cobrança</span>
            </button>
            <button
              onClick={() => handleApplyTemplate('saudacao')}
              className="p-2 text-left rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">Saudação Inicial</span>
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              showTemplates
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
            }`}
            title="Modelos Rápidos"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Modelos</span>
          </button>

          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Digite a mensagem para ${firstName}... (Shift+Enter para nova linha)`}
              className="w-full px-3.5 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Enviar</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
