import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { chatApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { getSocket } from "@/socket/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelativeTime } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; fullName: string };
  createdAt: string;
}

export default function ChatRoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const { data: room } = useQuery({
    queryKey: ["chat", "room", roomId],
    queryFn: () => chatApi.getRoom(roomId!).then((r) => r.data),
    enabled: !!roomId,
  });

  const { data: historyData } = useQuery({
    queryKey: ["chat", "messages", roomId],
    queryFn: () => chatApi.getMessages(roomId!).then((r) => r.data),
    enabled: !!roomId,
    onSuccess: (data: { messages: Message[] }) =>
      setMessages(data.messages || []),
  } as Parameters<typeof useQuery>[0]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    socket.emit("join_room", { roomId });

    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on(
      "user_typing",
      ({ userId, userName }: { userId: string; userName: string }) => {
        if (userId !== user?.id) setTypingUser(userName);
      },
    );

    socket.on("user_stop_typing", () => setTypingUser(""));

    return () => {
      socket.off("new_message");
      socket.off("user_typing");
      socket.off("user_stop_typing");
    };
  }, [roomId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(roomId!, { content }),
    onSuccess: () => {
      setInput("");
      qc.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });

  const handleSend = () => {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;
    sendMutation.mutate(text);
  };

  const handleTyping = (value: string) => {
    setInput(value);
    const socket = getSocket();
    if (!socket) return;
    if (!isTyping) {
      socket.emit("typing", { roomId });
      setIsTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId });
      setIsTyping(false);
    }, 1500);
  };

  const other =
    user?.role === "buyer"
      ? ((room as Record<string, unknown>)?.seller as Record<string, unknown>)
      : ((room as Record<string, unknown>)?.buyer as Record<string, unknown>);

  return (
    <div
      className="container py-4 max-w-2xl flex flex-col"
      style={{ height: "calc(100vh - 120px)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <Link to="/chat">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {((other?.fullName as string) || "?")[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{other?.fullName as string}</p>
          <p className="text-xs text-muted-foreground">
            Re: {(room as Record<string, unknown>)?.gem as string}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg) => {
          const isMine = msg.senderId === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${isMine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                >
                  {formatRelativeTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {typingUser && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2">
              <p className="text-xs text-muted-foreground italic">
                {typingUser} is typing...
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Input
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || sendMutation.isPending}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
