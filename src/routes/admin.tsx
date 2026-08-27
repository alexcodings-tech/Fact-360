import { createFileRoute, Link, Outlet, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import { LayoutDashboard, Users, ClipboardList, LogOut, Menu, ShieldCheck, Building2, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Portal — FACT 360°" }] }),
  beforeLoad: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) throw redirect({ to: "/auth" });
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!(roles ?? []).some((r: any) => r.role === "admin")) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

const nav: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users & Records", icon: Users },
  { to: "/admin/assessments", label: "Assessments", icon: ClipboardList },
  { to: "/admin/organisations", label: "Organisations", icon: Building2 },
  { to: "/admin/whatsapp", label: "WhatsApp Clients", icon: MessageCircle },
];

function SidebarContent({ onLogout }: { onLogout: () => void }) {
  const loc = useLocation();
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-2">
        <Logo inverse />
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-accent">Admin</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((n) => {
          const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to as any}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}>
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
        {/* Client View link intentionally hidden on the admin panel
        <Link to="/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60 mt-4">
          <ListChecks className="h-4 w-4" /> Client View
        </Link> */}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={onLogout} className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Once auth resolves, block non-admins (belt-and-suspenders alongside beforeLoad)
  useEffect(() => {
    if (!auth.loading && auth.user && !auth.isAdmin) navigate({ to: "/dashboard", replace: true });
  }, [auth.loading, auth.user, auth.isAdmin, navigate]);

  async function handleLogout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (auth.fullName ?? "A").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside className="hidden lg:block w-64 shrink-0 bg-sidebar text-sidebar-foreground sticky top-0 h-screen overflow-y-auto">
        <SidebarContent onLogout={handleLogout} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="lg:hidden p-2"><Menu className="h-5 w-5" /></SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-sidebar text-sidebar-foreground border-none">
                <SidebarContent onLogout={handleLogout} />
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-accent" />
              <div>
                <h1 className="text-lg font-bold text-primary">Admin Portal</h1>
                <p className="text-xs text-muted-foreground">Welcome, {auth.fullName ?? "—"}</p>
              </div>
            </div>
          </div>
          <Avatar className="h-9 w-9 bg-primary text-primary-foreground"><AvatarFallback>{initials}</AvatarFallback></Avatar>
        </header>
        <main className="flex-1 p-4 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
