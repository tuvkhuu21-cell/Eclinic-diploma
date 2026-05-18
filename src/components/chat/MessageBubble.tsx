import { cn } from "@/lib/utils";

type AttachmentPayload = {
  text?: string;
  attachment?: {
    url: string;
    name: string;
    mimeType?: string;
    size?: number;
  };
};

export function MessageBubble({ mine, text, status }: { mine?: boolean; text: string; status?: "sending" | "failed" }) {
  const payload = parsePayload(text);
  const bodyText = payload?.text ?? text;
  const attachment = payload?.attachment;
  const isImage = attachment?.mimeType?.startsWith("image/");
  return (
    <div className={cn("max-w-[72%] rounded-[20px] px-4 py-2.5 text-[15px] leading-5 shadow-sm", mine ? "ml-auto rounded-br-md bg-[#0084ff] text-white" : "rounded-bl-md bg-[#f0f2f5] text-slate-900")}>
      {bodyText && <p>{bodyText}</p>}
      {attachment && (
        <a href={attachment.url} target="_blank" rel="noreferrer" className={cn("mt-2 block overflow-hidden rounded-2xl border", mine ? "border-white/30 bg-white/10" : "border-slate-200 bg-white")}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.url} alt={attachment.name} className="max-h-64 w-full object-cover" />
          ) : null}
          <span className={cn("block px-3 py-2 text-xs font-bold", mine ? "text-white" : "text-[#0084ff]")}>{attachment.name}</span>
        </a>
      )}
      {status === "sending" && <p className={cn("mt-1 text-[11px] font-semibold", mine ? "text-white/70" : "text-slate-400")}>Илгээж байна...</p>}
      {status === "failed" && <p className="mt-1 text-[11px] font-bold text-rose-500">Илгээхэд алдаа гарлаа</p>}
    </div>
  );
}

function parsePayload(value: string): AttachmentPayload | null {
  try {
    const parsed = JSON.parse(value) as AttachmentPayload;
    if (parsed && typeof parsed === "object" && parsed.attachment?.url) return parsed;
    return null;
  } catch {
    return null;
  }
}
