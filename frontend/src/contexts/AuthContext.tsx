import {createContext, useContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {supabase} from "../supabaseClient.ts";
import type {User} from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
};

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const {data: {session}} = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        const {data: {subscription}} = supabase.auth.onAuthStateChange(
            async (_, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
        }, []);

        const signOut = async () => {
            await supabase.auth.signOut();
        };
        return (
            <AuthContext.Provider value={{user, loading, signOut}}>
                {children}
            </AuthContext.Provider>
        );
};