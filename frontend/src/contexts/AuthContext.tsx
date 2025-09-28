import {createContext, useContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {supabase} from "../supabaseClient.ts";
import type {User} from "@supabase/supabase-js";


interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

const exchangeTokenForCookie = async (token: string) => {
    try {
        await fetch(`${API_URL}/exchange-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({token})
            });
            console.log('Token exchanged for HttpOnly cookie')
        } catch (error) {
            console.error('Error exchanging token for cookie:', error);
    }
};

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const {data: {session}} = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setToken(session?.access_token ?? null);

            if (session?.access_token) {
                await exchangeTokenForCookie(session.access_token);
            }
            setLoading(false);
        };
        getSession();


        const {data: {subscription}} = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setUser(session?.user ?? null);
                setToken(session?.access_token ?? null);

                if (session?.access_token) {
                    await exchangeTokenForCookie(session.access_token);
                }
                setLoading(false);
            });


        return () => subscription.unsubscribe();
        }, []);

        const signOut = async () => {
            try {
                await supabase.auth.signOut();

                await fetch(`${API_URL}/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });

                console.log('Logged out successfully.');
            } catch (error) {
                console.log('Error logging out:', error);
            }

        };
        return (
            <AuthContext.Provider value={{user, token, loading, signOut}}>
                {children}
            </AuthContext.Provider>
        );

};