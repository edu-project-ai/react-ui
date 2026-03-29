import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import { useAgentChatMutation } from "../api/agentApi";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TASK_TYPE = "theory";
const DEFAULT_TASK_INSTRUCTION =
  "General Q&A with Blip AI learning assistant. Help the user with programming and learning questions.";

// ============================================================================
// Types
// ============================================================================

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ============================================================================
// Icons
// ============================================================================

const SendIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
));
SendIcon.displayName = "SendIcon";

const BrainIcon = memo(() => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
));
BrainIcon.displayName = "BrainIcon";

const SpinnerIcon = memo(() => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
));
SpinnerIcon.displayName = "SpinnerIcon";

// ============================================================================
// Empty state
// ============================================================================

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center flex-1 gap-4 text-center px-6 py-12">
    <div className="p-4 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
      <BrainIcon />
    </div>
    <div>
      <h3 className="text-base font-semibold text-foreground">Ask Blip anything</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Your AI learning companion. Ask about programming, learning paths, or any topic you&apos;re studying.
      </p>
    </div>
  </div>
));
EmptyState.displayName = "EmptyState";

// ============================================================================
// Message bubble
// ============================================================================

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = memo(({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mr-2 mt-1">
          <BrainIcon />
        </div>
      )}
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 text-sm
          ${isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
          }
        `}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <Markdown>{message.content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// ============================================================================
// Typing indicator
// ============================================================================

const TypingIndicator = memo(() => (
  <div className="flex justify-start mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mr-2">
      <BrainIcon />
    </div>
    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
    </div>
  </div>
));
TypingIndicator.displayName = "TypingIndicator";

// ============================================================================
// Main Page
// ============================================================================

export const AiMentorPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sendChat, { isLoading }] = useAgentChatMutation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const result = await sendChat({
        userMessage: trimmed,
        taskType: DEFAULT_TASK_TYPE,
        taskInstruction: DEFAULT_TASK_INSTRUCTION,
      }).unwrap();

      const assistantMessage: Message = { role: "assistant", content: result.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [inputValue, isLoading, sendChat]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4 bg-card">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
            <BrainIcon />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Blip AI Mentor</h1>
            <p className="text-xs text-muted-foreground">Your personal learning companion</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-card">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask Blip anything... (Enter to send, Shift+Enter for newline)"
              rows={1}
              disabled={isLoading}
              className="
                w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring
                disabled:opacity-50 disabled:cursor-not-allowed
                min-h-[44px] max-h-40
              "
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
            className="
              flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl
              bg-primary text-primary-foreground
              hover:opacity-90 transition-opacity
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {isLoading ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Blip can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  );
};
