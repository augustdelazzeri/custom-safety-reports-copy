"use client";

// P10 · Report by message (REL-5): the Access Point QR opens a conversation instead of a form.
// Same script as P1 · B; the variants change the channel and its constraints.

import { useState } from "react";
import { Globe, MessageCircle, QrCode, Smartphone } from "lucide-react";
import { FlowShell } from "@/components/ai-first/FlowShell";
import { useFlowVariant, type FlowVariantOption } from "@/components/ai-first/FlowVariantPicker";
import { ChatReport, type ChatTheme } from "@/components/ai-first/chat/ChatReport";
import { ACCESS_POINT } from "@/lib/ai-first/sample-data";

type Variant = "whatsapp" | "sms" | "web";

const OPTIONS: FlowVariantOption<Variant>[] = [
  { id: "whatsapp", name: "WhatsApp", description: "QR opens WhatsApp with a pre-filled message; confirm with “1 = send”; updates come back in the same chat", icon: MessageCircle },
  { id: "sms", name: "SMS / text message", description: "Works on any phone; photos by MMS; numbered replies", icon: Smartphone },
  { id: "web", name: "Web chat from the QR", description: "No WhatsApp Business API cost: the QR opens a chat page, no app and no login", icon: Globe },
];

const NOTES: Record<Variant, string[]> = {
  whatsapp: ["Needs the WhatsApp Business API and approved message templates.", "Phone number identifies the reporter; anonymous reports need a separate path."],
  sms: ["Works on any phone, no app.", "MMS photo quality varies; long summaries split into several texts."],
  web: ["No per-message cost and no Meta approval.", "Updates only reach the person if they leave a number."],
};

export default function MessagingReportPage() {
  const { variant, setVariant } = useFlowVariant<Variant>("whatsapp", OPTIONS);

  return (
    <FlowShell
      flowId="whatsapp"
      code="P10"
      title="Report by message"
      subtitle="The QR on the rack opens a conversation instead of a form · photo, voice and taps"
      device="mobile"
      options={OPTIONS}
      variant={variant}
      onVariantChange={setVariant}
    >
      <MessagingFlow key={variant} variant={variant} />
    </FlowShell>
  );
}

// Lives inside the shell so "Restart" goes back to the QR poster.
function MessagingFlow({ variant }: { variant: Variant }) {
  const [scanned, setScanned] = useState(false);
  return !scanned ? <QrPoster variant={variant} onScan={() => setScanned(true)} /> : <ChatReport theme={variant as ChatTheme} />;
}

function QrPoster({ variant, onScan }: { variant: Variant; onScan: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-5 bg-slate-800 p-6 text-center text-white">
      <p className="text-xs uppercase tracking-widest text-yellow-300">See something? Report it</p>
      <div className="rounded-2xl bg-white p-4">
        <QrCode className="h-36 w-36 text-slate-900" />
      </div>
      <div>
        <p className="text-lg font-semibold">{ACCESS_POINT.name}</p>
        <p className="text-sm text-white/70">
          Scan to report by {variant === "whatsapp" ? "WhatsApp" : variant === "sms" ? "text message" : "chat"} · {ACCESS_POINT.code}
        </p>
        <p className="mt-1 text-xs text-white/60">English · Español · Português · Tiếng Việt</p>
      </div>
      <button onClick={onScan} className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-slate-900">
        Scan the QR code
      </button>
      <ul className="w-full space-y-1 rounded-xl bg-white/10 p-3 text-left text-[11px] text-white/80">
        {NOTES[variant].map((n) => (
          <li key={n}>• {n}</li>
        ))}
      </ul>
    </div>
  );
}
