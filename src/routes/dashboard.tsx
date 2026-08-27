import { createFileRoute, Link, Outlet, useLocation, useNavigate, redirect } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import {
  LayoutDashboard, ClipboardList, FileText, Target, History, User2, Settings, LifeBuoy, LogOut, Bell, Menu, ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({ meta: [{ title: "Dashboard — FACT 360°" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: DashboardLayout,
});

const nav: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/assessments", label: "My Assessments", icon: ClipboardList },
  
  { to: "/dashboard/reports", label: "Reports", icon: FileText },
  { to: "/dashboard/action-plan", label: "Action Plan", icon: Target },
  { to: "/dashboard/purchases", label: "Purchase History", icon: History },
  { to: "/dashboard/profile", label: "Profile", icon: User2 },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
  { to: "/dashboard/support", label: "Support", icon: LifeBuoy },
];

function SidebarContent({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) {
  const loc = useLocation();
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-sidebar-border"><Logo inverse /></div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((n) => {
          const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to as any}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
            </Link>
          );
        })}
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-accent/15 text-accent mt-3">
            <ShieldCheck className="h-4 w-4" /> Admin Portal
          </Link>
        )}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={onLogout} className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/60">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );
}

function DashboardLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // If user is admin, push them to /admin (admin sees a separate portal)
  useEffect(() => {
    if (!auth.loading && auth.isAdmin) navigate({ to: "/admin", replace: true });
  }, [auth.loading, auth.isAdmin, navigate]);

  async function handleLogout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const initials = (auth.fullName ?? "U")
    .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen bg-secondary/40 print:block print:min-h-0 print:bg-white">
      <aside className="no-print hidden lg:block w-64 shrink-0 bg-sidebar text-sidebar-foreground sticky top-0 h-screen overflow-y-auto">
        <SidebarContent isAdmin={auth.isAdmin} onLogout={handleLogout} />
      </aside>
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <header className="no-print sticky top-0 z-30 h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-8">

          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="lg:hidden p-2"><Menu className="h-5 w-5" /></SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 bg-sidebar text-sidebar-foreground border-none">
                <SidebarContent isAdmin={auth.isAdmin} onLogout={handleLogout} />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="text-lg font-bold text-primary">Dashboard</h1>
              <p className="text-xs text-muted-foreground">Welcome back, {auth.fullName ?? "—"} 👋</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-md hover:bg-muted"><Bell className="h-5 w-5 text-muted-foreground" /></button>
            <div className="flex items-center gap-2">
              <Avatar className="h-9 w-9 bg-accent text-accent-foreground"><AvatarFallback>{initials}</AvatarFallback></Avatar>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-semibold text-primary">{auth.fullName ?? "—"}</div>
                <div className="text-[10px] text-muted-foreground">{auth.company ?? ""}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 print:p-0"><Outlet /></main>
      </div>
    </div>
  );
}
