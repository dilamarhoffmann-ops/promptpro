import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export const ProtectedRoute = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async (currentSession: any) => {
        if (currentSession?.user?.email) {
            // Skip check for admin
            if (currentSession.user.email !== 'dilamarhs@gmail.com') {
                const { data: authData } = await supabase
                    .from('authorized_emails')
                    .select('email')
                    .eq('email', currentSession.user.email)
                    .maybeSingle();

                if (!authData) {
                    await supabase.auth.signOut();
                    setSession(null);
                    setLoading(false);
                    return;
                }
            }
        }
        setSession(currentSession);
        setLoading(false);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            checkAuth(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            checkAuth(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
                Carregando...
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
