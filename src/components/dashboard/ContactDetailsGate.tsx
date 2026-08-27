import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Every paid module needs a phone number and an email on the client's profile so
 * the team can share the report and follow up. This hook checks both before an
 * assessment can be started and shows a prompt when either is missing.
 */
export function useContactDetailsGate() {
  const [open, setOpen] = useState(false);

  async function hasContactDetails() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return true;
    const { data: p } = await supabase
      .from("profiles")
      .select("phone, email")
      .eq("id", u.user.id)
      .maybeSingle();
    const ok = !!p?.phone?.trim() && !!(p as any)?.email?.trim();
    if (!ok) setOpen(true);
    return ok;
  }

  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <AlertCircle className="h-5 w-5 text-accent" /> Save your phone number and email
          </DialogTitle>
          <DialogDescription>
            Please save your phone number and email ID in your profile before starting this assessment. We use them to
            deliver your report and for follow-up support.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Not now</Button>
          <Link to="/dashboard/profile" onClick={() => setOpen(false)}>
            <Button className="bg-primary hover:bg-primary/90">Go to Profile</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { hasContactDetails, contactDialog: dialog };
}
