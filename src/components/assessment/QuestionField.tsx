import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Loader2, FileCheck2 } from "lucide-react";

export type QuestionValue = {
  score?: number | null;
  selectedLabel?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
  attachments?: { name: string; path: string }[];
};

export type QuestionDef = {
  id: string;
  text: string;
  type: string;
  required?: boolean;
  options?: { label: string; score?: number }[] | null;
};

export function QuestionField({
  question,
  index,
  value,
  onChange,
  onUpload,
}: {
  question: QuestionDef;
  index: number;
  value: QuestionValue | undefined;
  onChange: (v: QuestionValue) => void;
  onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);
  const options = Array.isArray(question.options) ? question.options : [];

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-border p-5">
      <div className="flex gap-3">
        <span className="text-sm font-semibold text-muted-foreground">{index + 1}.</span>
        <p className="text-base font-medium text-foreground">{question.text}</p>
      </div>

      <div className="mt-4 pl-7 space-y-3">
        {(question.type === "multiple_choice" || question.type === "true_false") && (
          <div className="flex flex-nowrap items-stretch gap-2 overflow-x-auto pb-1">
            {(options.length ? options : [{ label: "True", score: 5 }, { label: "False", score: 1 }]).map((o) => {
              const active = value?.selectedLabel === o.label;
              return (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => onChange({ ...value, selectedLabel: o.label, score: o.score ?? null })}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        )}

        {question.type === "text" && (
          <Textarea
            rows={3}
            placeholder="Your answer"
            defaultValue={value?.valueText ?? ""}
            onBlur={(e) => onChange({ ...value, valueText: e.target.value })}
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            className="max-w-[220px]"
            placeholder="0"
            defaultValue={value?.valueNumber ?? ""}
            onBlur={(e) => onChange({ ...value, valueNumber: e.target.value === "" ? null : Number(e.target.value) })}
          />
        )}

        {(question.type === "document" || question.type === "image" || question.type === "audio") && (
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-4 py-2 text-sm cursor-pointer hover:border-primary/60">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Attach file"}
              <input
                type="file"
                className="hidden"
                onChange={handleFile}
                accept={question.type === "image" ? "image/*" : question.type === "audio" ? "audio/*" : undefined}
              />
            </label>
            <div className="space-y-1">
              {(value?.attachments ?? []).map((a) => (
                <div key={a.path} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileCheck2 className="h-3.5 w-3.5 text-success" /> {a.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {(question.type === "text" || question.type === "number") && (
          <div className="pt-1">
            <label className="text-xs font-semibold text-muted-foreground">Supporting document (optional)</label>
            <div className="mt-1">
              <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary">
                <Paperclip className="h-3.5 w-3.5" /> Attach
                <input type="file" className="hidden" onChange={handleFile} />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
