export interface PromptData {
  role: string;
  task: string;
  context: string;
  reasoning: boolean;
  framework: string;
  format: string;
  validation: string;
  temperature: number;
  language: string;
}

export interface PromptSectionProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isTextArea?: boolean;
}

export enum FrameworkType {
  NONE = "",
  SWOT = "Análise SWOT (Forças, Fraquezas, Oportunidades, Ameaças)",
  W5H2 = "5W2H (What, Why, Where, When, Who, How, How much)",
  OKR = "OKR (Objectives and Key Results)",
  PMI = "Padrão PMI (Project Management Institute)",
  STAR = "Método STAR (Situação, Tarefa, Ação, Resultado)",
  AIDA = "AIDA (Atenção, Interesse, Desejo, Ação)"
}

export enum FormatType {
  TEXT = "Texto Corrido",
  TABLE = "Tabela Estruturada",
  LIST = "Lista de Bullets",
  JSON = "JSON",
  CODE = "Bloco de Código",
  MARKDOWN = "Markdown Rico"
}
