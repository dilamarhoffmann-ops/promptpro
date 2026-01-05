import React from 'react';
import { LucideIcon, Sparkles, Loader2 } from 'lucide-react';

interface InputSectionProps {
  label: string;
  description: string;
  icon: LucideIcon;
  value: string | boolean | number;
  onChange: (value: any) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select' | 'toggle' | 'slider';
  options?: { id: string; label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  onAssist?: () => void;
  isAssisting?: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  label,
  description,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = 'textarea',
  options,
  min = 0,
  max = 1,
  step = 0.1,
  onAssist,
  isAssisting = false
}) => {
  const showAssistButton = (type === 'textarea' || type === 'text') && onAssist;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
              {label}
            </h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>

        {showAssistButton && (
          <button
            onClick={onAssist}
            disabled={isAssisting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait"
            title="A IA irá escrever ou melhorar este campo para você"
          >
            {isAssisting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {isAssisting ? 'Gerando...' : 'IA Ajuda'}
          </button>
        )}
      </div>

      <div className="pl-12">
        {type === 'toggle' ? (
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={value as boolean}
                onChange={(e) => onChange(e.target.checked)}
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${value ? 'bg-brand-600' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${value ? 'transform translate-x-6' : ''}`}></div>
            </div>
            <span className="ml-3 text-sm font-medium text-slate-700">
              {value ? 'Ativado: A IA explicará o raciocínio.' : 'Desativado'}
            </span>
          </label>
        ) : type === 'slider' ? (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value as number}
              onChange={(e) => onChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <span className="text-sm font-medium text-slate-700 min-w-[3rem] text-right">
              {value}
            </span>
          </div>
        ) : type === 'select' ? (
          <select
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-700"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          >
            {options?.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            className={`w-full p-3 min-h-[100px] bg-slate-50 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-y text-slate-700 placeholder:text-slate-400 ${isAssisting ? 'border-purple-300 bg-purple-50 animate-pulse' : 'border-slate-200'}`}
            placeholder={placeholder}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={isAssisting}
          />
        ) : (
          <input
            type="text"
            className={`w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-slate-700 ${isAssisting ? 'border-purple-300 bg-purple-50 animate-pulse' : 'border-slate-200'}`}
            placeholder={placeholder}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={isAssisting}
          />
        )}
      </div>
    </div>
  );
};