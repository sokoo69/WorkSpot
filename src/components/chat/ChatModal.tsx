"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Message {
  _id: string;
  bookingId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export function ChatModal({
  isOpen,
  onClose,
  bookingId,
  spaceTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  spaceTitle: string;
}) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !bookingId) return;

    // Fetch existing messages
    setIsLoading(true);
    fetch(`/api/messages?bookingId=${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.data);
        } else {
          toast.error("Failed to load messages");
        }
      })
      .catch((e) => console.error("Error fetching messages:", e))
      .finally(() => setIsLoading(false));

    // Subscribe to Pusher channel
    if (!pusherClient) return;
    const channelName = `chat-${bookingId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => {
        // Prevent duplicate appending if the event fires twice or self-sent
        if (prev.find((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [isOpen, bookingId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, text: inputText }),
      });

      if (!res.ok) {
        toast.error("Failed to send message");
      }
      
      // If successful, the Pusher event will append the message to the list automatically!
      setInputText("");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chat: ${spaceTitle}`}>
      <div className="flex flex-col h-[60vh] max-h-[600px]">
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-[var(--base)] rounded-md border border-[var(--line)] mb-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--forest)]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--ink)]/50">
              <MessageSquare className="w-12 h-12 mb-2" />
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = session?.user?.id === msg.senderId;
              return (
                <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      isMine 
                        ? "bg-[var(--forest)] text-white rounded-tr-sm" 
                        : "bg-white border border-[var(--line)] text-[var(--ink)] rounded-tl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${isMine ? "text-white/70" : "text-[var(--ink)]/50"}`}>
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="flex gap-2 shrink-0">
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending || !inputText.trim()} className="shrink-0 bg-[var(--rust)] hover:bg-[var(--rust)]/90">
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </Modal>
  );
}
