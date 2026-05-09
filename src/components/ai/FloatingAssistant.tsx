"use client";

import { useState } from "react";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AiChatPanel } from "./AiChatPanel";

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-5 z-50 md:bottom-6">
      {open && <div className="mb-3"><AiChatPanel /></div>}
      <Button className="h-14 w-14 rounded-full px-0 shadow-soft" onClick={() => setOpen((value) => !value)} aria-label="AI туслах">{open ? <X /> : <Bot />}</Button>
    </div>
  );
}

