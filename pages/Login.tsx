
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.MouseEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Admin bypass for first user creation
        if (!cpf && email !== 'dilamarhs@gmail.com') {
            setError('Please enter your CPF to sign up.');
            setLoading(false);
            return;
        }

        try {
            // Check authorization (skip for admin)
            if (email !== 'dilamarhs@gmail.com') {
                const { data, error: authError } = await supabase
                    .from('authorized_cpfs')
                    .select('cpf')
                    .eq('cpf', cpf)
                    .maybeSingle();

                if (authError) {
                    console.error("Auth check error:", authError);
                    throw new Error('Error checking authorization.');
                }

                if (!data) {
                    throw new Error('This CPF is not authorized for registration. Please contact the administrator.');
                }
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        cpf: cpf
                    }
                }
            });

            if (error) {
                setError(error.message);
            } else {
                alert('Sign up successful! Please check your email to verify your account.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light font-display text-slate-900 antialiased selection:bg-primary selection:text-white" style={{ minHeight: 'max(884px, 100dvh)' }}>
            <div className="relative flex h-screen w-full flex-col overflow-hidden">
                <div className="absolute inset-0 z-0 h-full w-full">
                    <div className="h-full w-full bg-cover bg-center bg-no-repeat opacity-40" data-alt="Abstract glowing neural network AI visualization" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn6k2h88kUvsw8EmLZ4mrpRbs5e-lR6hKmGzZFQQLjtevZvD_yF1k1u91FumwK7W0X4Oe8Wvw0QlubIiZIGri4allg9aEtPVgQ7ayr9kvR_BNKNp9jx7OsCdkmiHr8KF5FhHhyxOT1-KXnuu3vbzs-cJ8VS7fWaHLwKab3LWBB8xIVn40Q3QKtV46SXBzdjakrPBFl8zEgPzAzre8EYyQpvRtbsaUKS1qQ29hNR83VtyvLj_Fdp7xMwWY1ldpnHV8Ypj0_GWi_6LIP')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-background-light/80 via-background-light/95 to-background-light"></div>
                </div>
                <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 sm:mx-auto sm:max-w-md sm:justify-center sm:px-8">
                    <div className="flex flex-col items-center pt-8 sm:pt-0">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-purple-600 shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-4xl text-white">auto_awesome</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 text-center pb-2">Welcome Back</h1>
                        <p className="text-slate-500 text-base font-normal text-center max-w-[280px]">Log in to ignite your creativity and continue generating prompts.</p>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center w-full">
                            {error}
                        </div>
                    )}

                    <div className="mt-8 flex flex-col gap-5 w-full">
                        <div className="group">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email</label>
                            <div className="relative flex w-full items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 select-none">person</span>
                                <input
                                    className="flex h-14 w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Password</label>
                            <div className="relative flex w-full items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 select-none">lock</span>
                                <input
                                    className="flex h-14 w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                                    placeholder="Enter your password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button className="absolute right-4 flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none">
                                    <span className="material-symbols-outlined text-xl">visibility</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <a className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">Forgot Password?</a>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">CPF (Only for Sign Up)</label>
                            <div className="relative flex w-full items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
                                <span className="material-symbols-outlined absolute left-4 text-slate-400 select-none">badge</span>
                                <input
                                    className="flex h-14 w-full rounded-xl border-none bg-transparent py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm"
                                    placeholder="Enter your CPF"
                                    type="text"
                                    value={cpf}
                                    onChange={(e) => setCpf(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : 'Log In'}
                            {!loading && <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>}
                        </button>

                    </div>
                    <div className="mt-8 flex flex-col items-center gap-4 pb-4">
                        <p className="text-sm text-slate-500">
                            Don't have an account?
                            <a
                                href="#"
                                onClick={handleSignUp}
                                className="font-semibold text-primary hover:underline ml-1"
                            >
                                Sign Up
                            </a>
                        </p>
                        <div className="h-1 w-1/3 rounded-full bg-slate-200 sm:hidden"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
