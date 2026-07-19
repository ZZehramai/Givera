import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { BotIcon, SendIcon, SparklesIcon, XIcon } from 'lucide-react';

type Message = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
};

const QUICK_PROMPTS = ['Find my receipts', 'Update my payment method', 'See my impact'];

const INITIAL_MESSAGES: Message[] = [
{
  id: 1,
  role: 'assistant',
  text: 'Hi Jordan — I’m your Givera assistant. I can help you manage your giving, receipts, and account settings.'
}];


export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageId = useRef(2);

  useEffect(() => {
    if (!isOpen) return;

    inputRef.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: messageId.current++,
      role: 'user',
      text: trimmedMessage
    };
    const reply: Message = {
      id: messageId.current++,
      role: 'assistant',
      text: getAssistantReply(trimmedMessage)
    };

    setMessages((current) => [...current, userMessage, reply]);
    setMessage('');
  };

  const useQuickPrompt = (prompt: string) => {
    const userMessage: Message = {
      id: messageId.current++,
      role: 'user',
      text: prompt
    };
    const reply: Message = {
      id: messageId.current++,
      role: 'assistant',
      text: getAssistantReply(prompt)
    };

    setMessages((current) => [...current, userMessage, reply]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7">
      {isOpen &&
      <section
        id="givera-assistant"
        aria-label="Givera assistant conversation"
        className="absolute bottom-16 right-0 flex h-[min(34rem,calc(100vh-7.5rem))] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-900/15">
        
          <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-givera text-white">
                <SparklesIcon className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Givera assistant</h2>
                <p className="text-xs text-givera">Here to help</p>
              </div>
            </div>
            <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close assistant"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-givera focus:ring-offset-2">
            
              <XIcon className="h-4 w-4" />
            </button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8f8f6] px-4 py-5" aria-live="polite">
            {messages.map((chatMessage) =>
          <div
            key={chatMessage.id}
            className={`flex ${chatMessage.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
                <p
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-5 ${
              chatMessage.role === 'user' ?
              'rounded-br-md bg-givera text-white' :
              'rounded-bl-md border border-neutral-200 bg-white text-neutral-700'}`
              }>
              
                  {chatMessage.text}
                </p>
              </div>
          )}
          </div>

          <div className="border-t border-neutral-100 bg-white px-4 pb-4 pt-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-0.5" aria-label="Suggested questions">
              {QUICK_PROMPTS.map((prompt) =>
            <button
              type="button"
              key={prompt}
              onClick={() => useQuickPrompt(prompt)}
              className="whitespace-nowrap rounded-full border border-givera/20 bg-givera/5 px-3 py-1.5 text-xs font-medium text-givera transition-colors hover:bg-givera/10 focus:outline-none focus:ring-2 focus:ring-givera focus:ring-offset-1">
              
                  {prompt}
                </button>
            )}
            </div>
            <form className="flex items-center gap-2" onSubmit={submitMessage}>
              <label htmlFor="assistant-message" className="sr-only">
                Ask the Givera assistant
              </label>
              <input
              ref={inputRef}
              id="assistant-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask about your account…"
              className="min-w-0 flex-1 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-givera focus:outline-none focus:ring-2 focus:ring-givera/20" />
            
              <button
              type="submit"
              aria-label="Send message"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-givera text-white transition-colors hover:bg-givera-dark focus:outline-none focus:ring-2 focus:ring-givera focus:ring-offset-2">
              
                <SendIcon className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      }

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="givera-assistant"
        aria-label={isOpen ? 'Close Givera assistant' : 'Open Givera assistant'}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-transform hover:scale-105 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
>
        <BotIcon className="h-6 w-6" />
        {!isOpen &&
        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#f4f4f2] bg-emerald-400" />
        }
      </button>
    </div>);

}

function getAssistantReply(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes('receipt') || normalized.includes('tax')) {
    return 'You have 5 tax receipts available. Open Account settings, then choose Tax receipts to view or download them.';
  }

  if (normalized.includes('payment') || normalized.includes('card')) {
    return 'You have 2 payment methods saved. You can update them from Account settings → Payment methods.';
  }

  if (normalized.includes('impact') || normalized.includes('campaign') || normalized.includes('donat')) {
    return 'You’ve contributed $1,245 across 5 campaigns. Your active campaigns send progress updates when new milestones are reached.';
  }

  if (normalized.includes('profile') || normalized.includes('email') || normalized.includes('phone')) {
    return 'Select Edit profile at the top of this page to update your personal details.';
  }

  return 'I can help you find receipts, update payment details, review your giving impact, or manage profile information.';
}