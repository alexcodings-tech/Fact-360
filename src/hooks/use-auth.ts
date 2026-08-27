import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type AuthState = {
  loading: boolean;
  user: User | null;
  isAdmin: boolean;
  fullName: string | null;
  company: string | null;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    loading: true,
    user: null,
    isAdmin: false,
    fullName: null,
    company: null,
  });

  useEffect(() => {
    let mounted = true;

    async function load(user: User | null) {
      if (!user) {
        if (mounted) setState({ loading: false, user: null, isAdmin: false, fullName: null, company: null });
        return;
      }
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user.id),
        supabase.from("profiles").select("full_name, company").eq("id", user.id).maybeSingle(),
      ]);
      if (!mounted) return;
      setState({
        loading: false,
        user,
        isAdmin: (roles ?? []).some((r: any) => r.role === "admin"),
        fullName: profile?.full_name ?? user.email ?? null,
        company: profile?.company ?? null,
      });
    }

    supabase.auth.getUser().then(({ data }) => load(data.user));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load(session?.user ?? null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
