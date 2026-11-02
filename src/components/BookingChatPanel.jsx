import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, MessageCircle } from 'lucide-react';

export default function BookingChatPanel({ booking, user, role }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const data = await base44.entities.Message.filter(
      { booking_request_id: booking.id },
      'created_date'
    );
    setMessages(data);
    setLoaded(true);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.booking_request_id === booking.id) load();
    });
    return unsub;
  }, [booking.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    await base44.entities.Message.create({
      booking_request_id: booking.id,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      sender_role: role,
      content: text.trim(),
    });
    setText('');
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const otherParty = role === 'customer'
    ? (booking.cook_email?.split('@')[0])
    : (booking.customer_name || booking.customer_email?.split('@')[0]);

  return (
    <div className="mt-4 border-t border-border pt-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Chat with {otherParty}
        </span>
        {messages.length > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">{messages.length} message{messages.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Message thread */}
      <div className="bg-muted/40 rounded-xl p-3 space-y-2 max-h-56 overflow-y-auto mb-3">
        {!loaded && (
          <p className="text-center text-xs text-muted-foreground py-4">Loading…</p>
        )}
        {loaded && messages.length === 0 && (
          <div className="text-center py-6">
            <MessageCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No messages yet.</p>
            <p className="text-xs text-muted-foreground">Discuss menu preferences, dietary needs, or quote details here.</p>
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.sender_email === user.email;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-muted-foreground mb-0.5 px-1">
                {isMe ? 'You' : m.sender_name}
              </span>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                isMe
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border border-border text-foreground rounded-bl-sm'
              }`}>
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="Type a message…"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}