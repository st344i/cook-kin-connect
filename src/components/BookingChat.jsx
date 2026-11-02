import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BookingChat({ booking, user, role, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    const data = await base44.entities.Message.filter(
      { booking_request_id: booking.id },
      'created_date'
    );
    setMessages(data);
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.data?.booking_request_id === booking.id) {
        load();
      }
    });
    return unsub;
  }, [booking.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
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

  const otherParty = role === 'customer' ? booking.cook_email : (booking.customer_name || booking.customer_email);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[520px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <DialogTitle className="font-playfair text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Chat with {otherParty}
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-10">
              No messages yet. Start the conversation!
            </p>
          )}
          {messages.map((m) => {
            const isMe = m.sender_email === user.email;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-muted-foreground mb-0.5 px-1">
                  {isMe ? 'You' : m.sender_name}
                </span>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            className="flex-1"
          />
          <Button size="icon" onClick={send} disabled={sending || !text.trim()} className="bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}