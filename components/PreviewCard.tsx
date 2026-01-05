import React, { useState } from 'react';
import { Copy, Check, Play, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PreviewCardProps {
  prompt: string;
  onRunTest: () => void;
  isTesting: boolean;
  testResult: string | null;
}

export const PreviewCard: React.FC<PreviewCardProps> = ({ prompt, onRunTest, isTesting, testResult }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="sticky top-6 space-y-6">
      {/* Prompt Preview */}
      <div className="bg-slate-900 text-slate-100 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-4rem)]">
        <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            Prompt Gerado
          </h2>
          <div className="flex gap-2">
             <button
              onClick={onRunTest}
              disabled={!prompt || isTesting}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Testar com Gemini
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap flex-grow bg-slate-900">
          {prompt || <span className="text-slate-500 italic">Preencha os campos à esquerda para ver o prompt sendo construído em tempo real...</span>}
        </div>
      </div>

      {/* Test Result Section */}
      {testResult && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-fade-in-up">
           <div className="p-3 bg-brand-50 border-b border-brand-100 flex justify-between items-center">
            <h3 className="font-semibold text-brand-800 text-sm">Resposta do Gemini</h3>
          </div>
          <div className="p-6 max-h-[400px] overflow-y-auto prose prose-slate prose-sm w-full max-w-none">
            <ReactMarkdown>{testResult}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
