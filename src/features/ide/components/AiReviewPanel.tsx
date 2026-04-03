import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, Loader2, Bot, Trash2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { useIdeStore } from '../store/useIdeStore';
import { startAgentStream } from '@/features/ai-mentor/api/agentStreamApi';

interface BlipHelperPanelProps {
  taskDescription: string;
  language: string;
  taskId?: string | null;
}

/** Typing dots indicator */
const TypingIndicator = memo(() => (
  <div className="flex justify-start mb-3">
    <div className="flex items-center gap-1 bg-[#2d2d2d] rounded-lg rounded-bl-sm px-3 py-2">
      <span className="w-1.5 h-1.5 bg-[#858585] rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-1.5 h-1.5 bg-[#858585] rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-1.5 h-1.5 bg-[#858585] rounded-full animate-bounce" />
    </div>
  </div>
));
TypingIndicator.displayName = 'TypingIndicator';

/** Single chat message */
const ChatMessage = memo(({ role, content }: { role: 'user' | 'assistant'; content: string }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="shrink-0 w-6 h-6 rounded-full bg-[#3d2d5c] text-[#dbb8ff] flex items-center justify-center mr-2 mt-0.5">
          <Bot size={12} />
        </div>
      )}
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] ${
          isUser
            ? 'bg-[#264f78] text-[#cccccc] rounded-br-sm'
            : 'bg-[#2d2d2d] text-[#cccccc] rounded-bl-sm'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-[13px] text-[#cccccc] leading-relaxed
            [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
            [&_code]:bg-[#1a1a1a] [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px]
            [&_pre]:bg-[#1a1a1a] [&_pre]:border [&_pre]:border-[#333] [&_pre]:rounded [&_pre]:p-2
            [&_ul]:pl-4 [&_ol]:pl-4
            [&_a]:text-[#4fc1ff] [&_a]:no-underline [&_a:hover]:underline">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
});
ChatMessage.displayName = 'ChatMessage';

export function BlipHelperPanel({ taskId }: BlipHelperPanelProps) {
  const visible = useIdeStore((s) => s.blipPanelVisible);
  const messages = useIdeStore((s) => s.blipMessages);
  const loading = useIdeStore((s) => s.blipLoading);
  const togglePanel = useIdeStore((s) => s.toggleBlipPanel);
  const addMessage = useIdeStore((s) => s.addBlipMessage);
  const setLoading = useIdeStore((s) => s.setBlipLoading);
  const clearMessages = useIdeStore((s) => s.clearBlipMessages);

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Cancel any in-flight stream on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || loading) return;

    addMessage({ role: 'user', content: trimmed });
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);

    void startAgentStream(
      { message: trimmed, taskId: taskId ?? null, taskType: 'code_review' },
      {
        onToken() {},
        onToolCall() {},
        onToolResult() {},
        onDone(event) {
          addMessage({ role: 'assistant', content: event.reply });
          setLoading(false);
        },
        onError(err) {
          if (err.name !== 'AbortError') {
            addMessage({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
          }
          setLoading(false);
        },
      },
      controller.signal,
    );
  }, [inputValue, loading, addMessage, setLoading, taskId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  }, []);

  if (!visible) return null;

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-l border-[#2d2d2d]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-[35px] min-h-[35px] bg-[#252526] border-b border-[#2d2d2d]">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-[#dbb8ff]" />
          <span className="text-[12px] font-semibold text-[#cccccc] uppercase tracking-wider">
            Blip Helper
          </span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="text-[#858585] hover:text-white transition-colors p-1 rounded hover:bg-[#3e3e3e]"
              title="Clear chat"
            >
              <Trash2 size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={togglePanel}
            className="text-[#858585] hover:text-white transition-colors p-1"
            title="Close panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 min-h-0">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-[#858585] text-[13px] text-center gap-3">
            <div className="p-3 rounded-full bg-[#3d2d5c]/30">
              <Bot size={22} className="text-[#dbb8ff]" />
            </div>
            <div>
              <p className="font-medium text-[#cccccc] mb-1">Hi! I'm Blip</p>
              <p className="text-[12px] max-w-[200px]">
                Ask me for help with your code, debugging, or any questions about this task.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-[#2d2d2d]">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Blip..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-md border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-2
              text-[13px] text-[#cccccc] placeholder:text-[#666]
              focus:outline-none focus:border-[#569cd6]
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[36px] max-h-[120px]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !inputValue.trim()}
            className="shrink-0 flex items-center justify-center w-[36px] h-[36px] rounded-md
              bg-[#0e639c] text-white hover:bg-[#1177bb]
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
