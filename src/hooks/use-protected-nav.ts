import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Returns a click handler that redirects unauthenticated users to /auth
 * instead of following the underlying link. Uses a cached session so clicks
 * respond instantly (no network round-trip on every click).
 */
export function useRequireAuthNav() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setHasSession(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) setHasSession(!!session);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (e: React.MouseEvent, opts?: { to: string; params?: any }) => {
    if (hasSession === false) {
      e.preventDefault();
      e.stopPropagation();
      toast.info("Please sign in to continue.");
      navigate({ to: "/auth" });
      return false;
    }
    if (opts) {
      e.preventDefault();
      navigate({ to: opts.to as any, params: opts.params });
    }
    return true;
  };
}
