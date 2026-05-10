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

export function MessageBubble({ mine, text }: { mine?: boolean; text: string }) {
  const payload = parsePayload(text);
  const bodyText = payload?.text ?? text;
  const attachment = payload?.attachment;
  const isImage = attachment?.mimeType?.startsWith("image/");
  return (
    <div className={cn("max-w-[75%] rounded-lg p-3 text-sm", mine ? "ml-auto bg-medical text-white" : "bg-slate-100 text-slate-700")}>
      {bodyText && <p>{bodyText}</p>}
      {attachment && (
        <a href={attachment.url} target="_blank" rel="noreferrer" className={cn("mt-2 block overflow-hidden rounded-lg border", mine ? "border-white/30 bg-white/10" : "border-sky-100 bg-white")}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={attachment.url} alt={attachment.name} className="max-h-48 w-full object-cover" />
          ) : null}
          <span className={cn("block px-3 py-2 text-xs font-bold", mine ? "text-white" : "text-medical")}>{attachment.name}</span>
        </a>
      )}
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
