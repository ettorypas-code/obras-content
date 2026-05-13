import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) syncProfileFromSupabase(u);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) syncProfileFromSupabase(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carrega perfil do Supabase se não estiver no localStorage
  function syncProfileFromSupabase(u) {
    const local = localStorage.getItem('obras_profile');
    if (!local && u.user_metadata?.obras_profile) {
      localStorage.setItem('obras_profile', JSON.stringify(u.user_metadata.obras_profile));
    }
  }

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  // Salva perfil tanto no localStorage quanto no Supabase user_metadata
  const saveProfile = async (profile) => {
    localStorage.setItem('obras_profile', JSON.stringify(profile));
    await supabase.auth.updateUser({ data: { obras_profile: profile } });
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, saveProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
