import { useEffect, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

import api from "../api/axios";
import { useLanguage } from "../i18n/LanguageContext";

export default function GiveraChatbot() {
  const { language, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(() => [{ role: "assistant", content: t("chatWelcome") }]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  const sendMessage = async (event, suggestedMessage = "") => {
    event?.preventDefault();
    const content = (suggestedMessage || input).trim();
    if (!content || sending) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      const { data } = await api.post("/ai/help/", {
        message: content,
        language,
        history: messages.slice(-8),
      });
      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: t("chatError") }]);
    } finally {
      setSending(false);
    }
  };

  const quickQuestions = [t("chatQuickCampaign"), t("chatQuickPayment"), t("chatQuickReports")];

  return (
    <div className="fixed bottom-5 right-5 z-[80] sm:bottom-7 sm:right-7">
      {open && (
        <section
          aria-label={t("chatTitle")}
          className="mb-3 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-[26px] border border-[#DED6F5] bg-white shadow-[0_24px_70px_rgba(34,24,72,.24)]"
        >
          <header className="flex items-center justify-between bg-[#6F52D9] px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FFD66B] text-[#271B4D]"><Bot size={24} /></span>
              <div>
                <h3 className="text-xl font-extrabold">{t("chatTitle")}</h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#D9D1F4]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {t("chatOnline")}</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
          </header>

          <div className="flex-1 overflow-y-auto bg-[#FAF9FD] px-4 py-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-[#FFD66B] text-black" : "rounded-bl-md border border-[#E8E3F5] bg-[#DED4FF] text-black shadow-sm"}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {quickQuestions.map((question) => (
                    <button key={question} type="button" onClick={(event) => sendMessage(event, question)} className="rounded-full border border-[#D9CFF8] bg-white px-3 py-2 text-left text-xs font-bold text-[#6247C5] transition hover:bg-[#F1EDFF]">
                      {question}
                    </button>
                  ))}
                </div>
              )}
              {sending && <div className="flex justify-start"><div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-[#E8E3F5] bg-white px-4 py-3 shadow-sm"><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6F52D9]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6F52D9] [animation-delay:120ms]" /><span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6F52D9] [animation-delay:240ms]" /></div></div>}
              <div ref={scrollRef} />
            </div>
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-[#FAF9FD] p-1.5 focus-within:border-[#8B73DF]">
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) sendMessage(event); }} maxLength={800} rows={1} placeholder={t("chatPlaceholder")} className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-slate-400" />
              <button disabled={!input.trim() || sending} aria-label={t("chatSend")} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#6F52D9] text-white transition hover:bg-[#5C41C6] disabled:cursor-not-allowed disabled:opacity-40"><Send size={17} /></button>
            </div>
            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-slate-400"><Sparkles size={11} /> {t("chatScope")}</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? t("close") : t("chatOpen")}
        aria-expanded={open}
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#6F52D9] text-white shadow-[0_12px_30px_rgba(111,82,217,.4)] transition hover:-translate-y-1 hover:bg-[#5D42C4] focus:outline-none focus:ring-4 focus:ring-[#DDD4FA]"
      >
        {open ? <X size={22} /> : <MessageCircle size={23} />}
      </button>
    </div>
  );
}
