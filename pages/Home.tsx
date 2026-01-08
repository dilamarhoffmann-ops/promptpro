import { User } from '@supabase/supabase-js';
import React, { useState, useMemo, useEffect } from 'react';
import { PromptData } from '../types';
import { SECTIONS_CONFIG } from '../constants';
import { InputSection } from '../components/InputSection';
import { PreviewCard } from '../components/PreviewCard';
import { generateResponse, refinePromptSection } from '../services/geminiService';
import { Sparkles, Trash2, Gauge, Globe, ShieldCheck } from 'lucide-react';
import { LANGUAGES } from '../constants';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut } from 'lucide-react';

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

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string, email: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir o perfil do usuário ${email}? Isso removerá os dados do perfil, mas o login continuará existindo no sistema de autenticação até ser removido manualmente pelo administrador no console do Supabase.`)) return;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchUsers();
        } catch (error) {
            alert(`Erro ao excluir usuário: ${(error as Error).message}`);
        }
    };

    if (loading && users.length === 0) return <div className="text-sm text-slate-400">Carregando usuários...</div>;

    if (users.length === 0) return <div className="text-sm text-slate-400">Nenhum usuário registrado encontrado.</div>;

    return (
        <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-700/50 text-slate-400">
                <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Email</th>
                    <th className="px-4 py-3">Registrado em</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3">{u.email}</td>
                        <td className="px-4 py-3 text-slate-500">
                            {new Date(u.created_at).toLocaleDateString()} {new Date(u.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                            <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Excluir Perfil"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const AuthorizedEmailsList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmails = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('authorized_emails')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setEmails(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchEmails();
    }, [refreshTrigger]);

    const handleDelete = async (email: string) => {
        if (!window.confirm(`Tem certeza que deseja remover a autorização do e-mail ${email}?`)) return;

        try {
            const { error } = await supabase
                .from('authorized_emails')
                .delete()
                .eq('email', email);

            if (error) throw error;
            fetchEmails();
        } catch (error) {
            alert(`Erro ao remover e-mail: ${(error as Error).message}`);
        }
    };

    if (loading && emails.length === 0) return <div className="text-sm text-slate-400">Carregando e-mails...</div>;

    if (emails.length === 0) return <div className="text-sm text-slate-400">Nenhum e-mail autorizado encontrado.</div>;

    return (
        <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-700/50 text-slate-400">
                <tr>
                    <th className="px-4 py-3 rounded-tl-lg">E-mail</th>
                    <th className="px-4 py-3">Autorizado em</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {emails.map((e) => (
                    <tr key={e.email} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{e.email}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                            {new Date(e.created_at).toLocaleDateString()} {new Date(e.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                            <button
                                onClick={() => handleDelete(e.email)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Remover Autorização"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


const Home: React.FC = () => {
    const [promptData, setPromptData] = useState<PromptData>(INITIAL_STATE);
    const [user, setUser] = useState<User | null>(null);
    const [authEmail, setAuthEmail] = useState('');
    const [authMessage, setAuthMessage] = useState('');
    const [refreshEmails, setRefreshEmails] = useState(0);
    const navigate = useNavigate();

    const [testResult, setTestResult] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [assistingSections, setAssistingSections] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleAuthorizeEmail = async () => {
        if (!authEmail) return;
        setAuthMessage('Autorizando...');
        try {
            const { error } = await supabase.from('authorized_emails').insert({ email: authEmail });
            if (error) throw error;
            setAuthMessage(`E-mail ${authEmail} autorizado com sucesso!`);
            setAuthEmail('');
            setRefreshEmails(prev => prev + 1);
            // Clear message after 3 seconds
            setTimeout(() => setAuthMessage(''), 3000);
        } catch (error) {
            setAuthMessage(`Erro: ${(error as Error).message}`);
        }
    };


    const isAdmin = user?.email === 'dilamarhs@gmail.com';

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
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            setTestResult(`Erro: ${errorMessage}. (Verifique se a chave GEMINI_API_KEY está configurada no Vercel e se o projeto foi refeito/redeploy)`);
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
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 hidden sm:block">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                            >
                                <LogIn size={18} />
                                Login
                            </button>
                        )}
                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        <div className="text-sm text-slate-500 hidden sm:block">
                            Created by Dilamar
                        </div>
                    </div>
                </div>
            </header>

            {/* Admin Panel */}
            {isAdmin && (
                <div className="bg-slate-800 text-white py-4 px-4 sm:px-6 lg:px-8 shadow-inner">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-green-400" size={24} />
                            <div>
                                <h3 className="font-semibold text-sm sm:text-base">Painel Administrativo</h3>
                                <p className="text-xs text-slate-400">Gerenciar autorizações e usuários</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="E-mail para autorizar"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                className="px-3 py-2 rounded text-slate-900 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-green-400"
                            />
                            <button
                                onClick={handleAuthorizeEmail}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                Autorizar
                            </button>
                        </div>
                        {authMessage && (
                            <span className="text-sm font-medium text-green-300 animate-pulse">{authMessage}</span>
                        )}
                    </div>

                    {/* Admin Lists */}
                    <div className="max-w-7xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Authorized Emails List */}
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                            <details className="group" open>
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined transition-transform group-open:rotate-90">arrow_right</span>
                                        E-mails Autorizados
                                    </div>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Gerenciamento</span>
                                </summary>
                                <div className="p-4 overflow-x-auto">
                                    <AuthorizedEmailsList refreshTrigger={refreshEmails} />
                                </div>
                            </details>
                        </div>

                        {/* Registered Users List */}
                        <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                            <details className="group">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none text-sm font-medium text-slate-300 hover:text-white transition-colors bg-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined transition-transform group-open:rotate-90">arrow_right</span>
                                        Usuários Registrados (Profiles)
                                    </div>
                                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Leitura</span>
                                </summary>
                                <div className="p-4 overflow-x-auto">
                                    <UsersList />
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            )}


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

export default Home;
