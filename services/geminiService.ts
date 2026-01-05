import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateResponse = async (prompt: string, temperature: number = 0.7): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não encontrada (process.env.API_KEY).");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        temperature: temperature
      }
    });

    return response.text || "Nenhuma resposta gerada.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    throw error;
  }
};

export const refinePromptSection = async (sectionLabel: string, currentText: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("Chave de API não encontrada.");
  }

  const userContext = currentText.trim()
    ? `O usuário digitou o seguinte rascunho: "${currentText}"`
    : "O campo está vazio. Gere um exemplo genérico, porém robusto e profissional.";

  const prompt = `
    Atue como um Engenheiro de Prompt Especialista.
    Sua tarefa é escrever (ou melhorar) o conteúdo para a seção: "${sectionLabel}" de um prompt estruturado.
    
    ${userContext}
    
    Escreva apenas o conteúdo aprimorado para este campo específico. Seja direto, detalhado e profissional.
    Não use aspas no início ou fim, apenas o texto.
    Se o input for muito curto, expanda com criatividade para torná-lo útil.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || currentText;
  } catch (error) {
    console.error("Erro ao refinar seção:", error);
    return currentText;
  }
};