import { FrameworkType, FormatType } from './types';
import {
  Briefcase,
  Target,
  BookOpen,
  BrainCircuit,
  LayoutTemplate,
  FileText,
  CheckCircle2
} from 'lucide-react';

export const FRAMEWORKS = Object.entries(FrameworkType).map(([key, value]) => ({
  id: key,
  label: value || "Nenhum / Personalizado",
  value: value
}));

export const FORMATS = Object.entries(FormatType).map(([key, value]) => ({
  id: key,
  label: value,
  value: value
}));

export const LANGUAGES = [
  { id: 'pt-BR', label: 'Português (Brasil)', value: 'Português do Brasil' },
  { id: 'en-US', label: 'Inglês (EUA)', value: 'English (US)' },
  { id: 'es', label: 'Espanhol', value: 'Español' },
  { id: 'fr', label: 'Francês', value: 'Français' },
  { id: 'de', label: 'Alemão', value: 'Deutsch' },
];

export const SECTIONS_CONFIG = [
  {
    id: 'role',
    icon: Briefcase,
    label: 'Função',
    description: 'Atribua uma especialidade ou persona à IA.',
    placeholder: 'Ex: Especialista em Marketing Digital Sênior com 10 anos de experiência...'
  },
  {
    id: 'task',
    icon: Target,
    label: 'Tarefa',
    description: 'Indique a ação principal a ser executada.',
    placeholder: 'Ex: Criar um plano de conteúdo para o LinkedIn...'
  },
  {
    id: 'context',
    icon: BookOpen,
    label: 'Contexto',
    description: 'Forneça informações relevantes e antecedentes.',
    placeholder: 'Ex: A empresa vende software B2B para pequenas empresas. O objetivo é aumentar leads...'
  },
  {
    id: 'validation',
    icon: CheckCircle2,
    label: 'Validação',
    description: 'Critérios de qualidade, estilo e restrições.',
    placeholder: 'Ex: Use tom profissional, evite jargões técnicos, máximo de 300 palavras...'
  },
  {
    id: 'reasoning',
    icon: BrainCircuit,
    label: 'Raciocínio',
    description: 'Instrua a IA a refletir passo a passo antes de responder.',
    isToggle: true
  },
  {
    id: 'framework',
    icon: LayoutTemplate,
    label: 'Framework',
    description: 'Escolha uma metodologia para estruturar a resposta.',
    isSelect: true,
    options: FRAMEWORKS
  },
  {
    id: 'format',
    icon: FileText,
    label: 'Formato',
    description: 'Como a saída deve ser apresentada?',
    isSelect: true,
    options: FORMATS
  }
];
