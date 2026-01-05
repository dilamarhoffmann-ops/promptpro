import React, { useState, useMemo } from 'react';
import { PromptData } from './types';
import { SECTIONS_CONFIG } from './constants';
import { InputSection } from './components/InputSection';
import { PreviewCard } from './components/PreviewCard';
import { generateResponse, refinePromptSection } from './services/geminiService';
import { Sparkles, Trash2, Gauge, Globe } from 'lucide-react';
import { LANGUAGES } from './constants';
import { supabase } from './services/supabaseClient';

const INITIAL_STATE: PromptData = {
  role: '',
  task: '',
  context: '',
  reasoning: false,
  framework: '',
  format: '',
  validation: '',
  temperature: 0.7,
  language: 'pt-BR'
};

const App: React.FC = () => {
  const [promptData, setPromptData] = useState<PromptData>(INITIAL_STATE);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [assistingSections, setAssistingSections] = useState<Record<string, boolean>>({});

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await generateResponse(constructedPrompt, promptData.temperature);
      setTestResult(result);

      // Save to Supabase
      const { error } = await supabase.from('prompts').insert({
        role: promptData.role,
        task: promptData.task,
        context: promptData.context,
        temperature: promptData.temperature,
        language: promptData.language,
        final_prompt: constructedPrompt,
        generated_response: result
      });

      if (error) {
        console.error('Error saving prompt:', error);
      }
    } catch (error) {
      setTestResult("Erro ao conectar com a API. Verifique se a chave de API (process.env.API_KEY) está configurada corretamente.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os campos?')) {
      setPromptData(INITIAL_STATE);
      setTestResult(null);
    }
  };

  const handleInputChange = (field: keyof PromptData, value: any) => {
    setPromptData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectionAssist = async (fieldId: string, label: string) => {
    const currentVal = promptData[fieldId as keyof PromptData];

    // Set loading for specific section
    setAssistingSections(prev => ({ ...prev, [fieldId]: true }));

    try {
      const refinedText = await refinePromptSection(label, currentVal as string);
      handleInputChange(fieldId as keyof PromptData, refinedText);
    } catch (error) {
      console.error("Failed to assist:", error);
    } finally {
      setAssistingSections(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const constructedPrompt = useMemo(() => {
    const parts = [];

    // 1. Function / Role
    if (promptData.role) {
      parts.push(`Atue como um ${promptData.role}.`);
    }

    // 2. Task
    if (promptData.task) {
      parts.push(`${promptData.task}`);
    }

    // 3. Context
    if (promptData.context) {
      parts.push(`${promptData.context}`);
    }

    // 4. Reasoning (Chain of Thought)
    if (promptData.reasoning) {
      parts.push(`Antes de fornecer a resposta final, pense passo a passo sobre o problema. Analise as restrições, considere múltiplas perspectivas e planeje sua resposta para garantir a melhor solução.`);
    }

    // 5. Framework
    if (promptData.framework) {
      parts.push(`Utilize a estrutura ${promptData.framework} para organizar sua resposta.`);
    }

    // 6. Format
    if (promptData.format) {
      parts.push(`A resposta deve ser apresentada no seguinte formato: ${promptData.format}.`);
    }

    // 7. Validation
    if (promptData.validation) {
      parts.push(`Certifique-se de seguir estes critérios: ${promptData.validation}`);
    }

    // 9. Language Override
    if (promptData.language) {
      const selectedLang = LANGUAGES.find(l => l.id === promptData.language)?.value || promptData.language;
      parts.push(`Responda APENAS em ${selectedLang}.`);
    }

    return parts.join('\n\n');
  }, [promptData]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PromptMaster <span className="text-brand-600">Pro</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 hidden sm:block">
              Create by Dilamar
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Builder Form */}
          <div className="lg:col-span-7 space-y-6 pb-20">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex-grow mr-4">
                <p className="text-blue-800 text-sm">
                  Preencha os tópicos. Use o botão <strong>"IA Ajuda"</strong> para que o Gemini escreva o conteúdo por você.
                </p>
              </div>
              <button
                onClick={handleClear}
                className="shrink-0 flex items-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
              >
                <Trash2 size={16} />
                Limpar
              </button>
            </div>

            {SECTIONS_CONFIG.map((section) => (
              <InputSection
                key={section.id}
                label={section.label}
                description={section.description}
                icon={section.icon}
                value={promptData[section.id as keyof PromptData]}
                onChange={(val) => handleInputChange(section.id as keyof PromptData, val)}
                placeholder={section.placeholder}
                type={
                  section.isToggle ? 'toggle' :
                    section.isSelect ? 'select' :
                      'textarea'
                }
                options={section.options}
                onAssist={
                  // Only allow assist for text-based fields
                  !section.isToggle && !section.isSelect
                    ? () => handleSectionAssist(section.id, section.label)
                    : undefined
                }
                isAssisting={!!assistingSections[section.id]}
              />
            ))}

            {/* Refinement Section */}
            <div>


              <div className="space-y-6">
                <InputSection
                  label="Temperatura (Criatividade)"
                  description="Controla a aleatoriedade: 0 é focado e determinado, 1 é criativo e variado."
                  icon={Gauge}
                  value={promptData.temperature}
                  onChange={(val) => handleInputChange('temperature', val)}
                  type="slider"
                  min={0}
                  max={1}
                  step={0.1}
                />



                <InputSection
                  label="Idioma de Saída"
                  description="Em qual idioma a IA deve responder?"
                  icon={Globe}
                  value={promptData.language}
                  onChange={(val) => handleInputChange('language', val)}
                  type="select"
                  options={LANGUAGES}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Action */}
          <div className="lg:col-span-5 relative">
            <PreviewCard
              prompt={constructedPrompt}
              onRunTest={handleRunTest}
              isTesting={isTesting}
              testResult={testResult}
            />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;