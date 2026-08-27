import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGS, setLang } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n } = useTranslation();
  return (
    <Select value={i18n.language} onValueChange={(v) => setLang(v)}>
      <SelectTrigger className={compact ? "h-8 w-auto gap-1 border-none bg-transparent text-xs" : "h-9 w-[130px]"}>
        <Globe className="h-3.5 w-3.5" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
