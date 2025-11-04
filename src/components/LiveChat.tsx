import { useEffect, useRef, useState } from "react";
import { supabase, type ChatMessage, sendMessage, subscribeToChat, getChatMessages, trackViewer, ensureMatch } from "../services/supabase";

interface LiveChatProps {
  matchId: string;
  matchTitle: string;
}

export default function LiveChat({ matchId, matchTitle }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [username, setUsername] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Ensure match exists and load initial messages
  useEffect(() => {
    if (!supabase || !matchId) return;

    let viewerCleanup: (() => void) | null = null;
    let chatCleanup: (() => void) | null = null;

    (async () => {
      // Ensure match exists
      await ensureMatch(matchId, matchTitle);

      // Load initial messages
      const { data } = await getChatMessages(matchId, 100);
      if (data) {
        setMessages(data);
      }

      // Track online viewers using Presence API
      const currentUsername = username || localStorage.getItem(`chat_username_${matchId}`) || 'Anonymous';
      viewerCleanup = trackViewer(matchId, currentUsername, (count) => {
        setViewerCount(count);
      });

      // Subscribe to new messages
      chatCleanup = subscribeToChat(matchId, (newMessage) => {
        setMessages((prev) => {
          // Prevent duplicate messages by checking if message ID already exists
          const exists = prev.some((msg) => msg.id === newMessage.id);
          if (exists) {
            return prev;
          }
          
          // Filter out own messages from broadcast (we already added them optimistically)
          // But allow if it's a real message replacing temp message
          if (newMessage.username.toLowerCase() === currentUsername.toLowerCase()) {
            // Check if we have a temp message with same content
            const hasTempMessage = prev.some(
              (msg) => 
                msg.id.startsWith('temp-') && 
                msg.username.toLowerCase() === newMessage.username.toLowerCase() &&
                msg.message === newMessage.message
            );
            if (hasTempMessage) {
              // Replace temp message with real one
              return prev.map((msg) => {
                if (
                  msg.id.startsWith('temp-') && 
                  msg.username.toLowerCase() === newMessage.username.toLowerCase() &&
                  msg.message === newMessage.message
                ) {
                  return newMessage;
                }
                return msg;
              });
            }
            // Don't add own message if we already have it (optimistic update)
            return prev;
          }
          
          return [...prev, newMessage];
        });
      });
    })();

    return () => {
      if (viewerCleanup) viewerCleanup();
      if (chatCleanup) chatCleanup();
    };
  }, [matchId, matchTitle, username]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load saved username from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`chat_username_${matchId}`);
    if (saved) {
      setUsername(saved);
      setIsRegistered(true);
    }
  }, [matchId]);

  const handleRegister = () => {
    if (!username.trim()) return;
    const trimmedUsername = username.trim();
    localStorage.setItem(`chat_username_${matchId}`, trimmedUsername);
    setUsername(trimmedUsername);
    setIsRegistered(true);
    // Re-track viewer with new username
    if (supabase && matchId) {
      // This will trigger useEffect to re-run with new username
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !isRegistered || sending) return;

    const messageText = messageInput.trim();
    setSending(true);
    
    // Optimistically add message to UI (will be confirmed by broadcast)
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      match_id: matchId,
      username: username,
      message: messageText,
      created_at: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");

    const { error, data } = await sendMessage(matchId, username, messageText);
    if (error) {
      console.error("Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    } else if (data) {
      // Replace temp message with real message from server
      setMessages((prev) => 
        prev.map((msg) => msg.id === tempMessage.id ? data : msg)
      );
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isRegistered) {
        handleRegister();
      } else {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="live-chat">
      <div className="live-chat-header">
        <h3 className="live-chat-title">Live Chat</h3>
        <span className="live-chat-viewers">{viewerCount} viewers</span>
      </div>
      <div className="live-chat-rules">
        be respectful - don't spam - enjoy the stream
      </div>
      <div 
        className={`live-chat-messages ${!isRegistered ? 'live-chat-blurred' : ''}`} 
        ref={chatContainerRef}
      >
        {messages.length === 0 ? (
          <div className="live-chat-empty">No messages yet. Be the first to chat!</div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.username.toLowerCase() === username.toLowerCase();
            return (
              <div 
                key={msg.id} 
                className={`live-chat-message ${isOwnMessage ? 'live-chat-message-own' : ''}`}
              >
                <span className={`live-chat-username ${isOwnMessage ? 'live-chat-username-own' : ''}`}>
                  {msg.username}:
                </span>
                <span className="live-chat-text">{msg.message}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {!isRegistered ? (
        <div className="live-chat-input">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            className="live-chat-username-input"
          />
          <button onClick={handleRegister} className="live-chat-register-btn">
            Register
          </button>
        </div>
      ) : (
        <div className="live-chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="live-chat-message-input"
          />
        </div>
      )}
    </div>
  );
}

