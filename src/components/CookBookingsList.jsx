import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChefHat, Calendar, Users, DollarSign, ClipboardList, MessageCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import IngredientListModal from '@/components/IngredientListModal';
import BookingChatPanel from '@/components/BookingChatPanel';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  quoted: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function CookBookingsList({ cookEmail }) {
  const { toast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [cookNotes, setCookNotes] = useState('');
  const [ingredientBooking, setIngredientBooking] = useState(null);
  const [openChatId, setOpenChatId] = useState(null);
  const [cookUser, setCookUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setCookUser).catch(() => {}); }, []);

  const load = async () => {
    const data = await base44.entities.BookingRequest.filter({ cook_email: cookEmail }, '-created_date');
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [cookEmail]);

  const sendQuote = async () => {
    await base44.entities.BookingRequest.update(selectedBooking.id, {
      status: 'quoted',
      quoted_price: parseFloat(quoteAmount),
      cook_notes: cookNotes,
    });
    toast({ title: 'Quote sent to customer!' });
    setSelectedBooking(null);
    load();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.BookingRequest.update(id, { status });
    toast({ title: `Booking marked as ${status}` });
    load();
  };

  const markPaid = async (booking) => {
    await base44.entities.BookingRequest.update(booking.id, { status: 'paid' });
    toast({ title: 'Booking marked as paid! Sending invoice…' });
    try {
      await base44.functions.invoke('sendInvoice', { booking_id: booking.id });
      toast({ title: 'Invoice sent to customer!' });
    } catch (e) {
      toast({ title: 'Invoice email failed', description: e.message, variant: 'destructive' });
    }
    load();
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading bookings…</div>;

  if (bookings.length === 0) return (
    <div className="text-center py-20">
      <ChefHat className="w-14 h-14 mx-auto mb-4 text-muted-foreground opacity-40" />
      <p className="text-muted-foreground">No booking requests yet. Make sure you're set as available!</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {bookings.map(b => (
        <div key={b.id} className="bg-card rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-foreground">{b.customer_name || b.customer_email}</p>
              <p className="text-sm text-muted-foreground">{b.customer_address}</p>
            </div>
            <Badge className={`${statusColors[b.status]} border text-xs font-semibold capitalize`}>{b.status}</Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.requested_date} {b.requested_time}</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.number_of_people} people</span>
            {b.quoted_price && <span className="flex items-center gap-1 text-accent font-semibold"><DollarSign className="w-3.5 h-3.5" /> ${b.quoted_price} quoted</span>}
          </div>

          {/* Dishes */}
          <div className="flex flex-wrap gap-1 mb-4">
            {b.dishes?.map((d, i) => (
              <span key={i} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-lg">{d.name} ×{d.servings}</span>
            ))}
          </div>

          {b.special_requests && (
            <p className="text-xs text-muted-foreground italic mb-4 bg-muted rounded-lg px-3 py-2">"{b.special_requests}"</p>
          )}

          <div className="flex flex-wrap gap-2">
            {b.status === 'pending' && (
              <>
                <Button size="sm" onClick={() => { setSelectedBooking(b); setQuoteAmount(''); setCookNotes(''); }} className="bg-accent hover:bg-accent/90 text-white">
                  <DollarSign className="w-3.5 h-3.5 mr-1" /> Send Quote
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'rejected')} className="text-destructive border-destructive/30">
                  Decline
                </Button>
              </>
            )}
            {b.status === 'accepted' && (
              <>
                <Button size="sm" onClick={() => setIngredientBooking(b)} variant="outline" className="gap-1">
                  <ClipboardList className="w-3.5 h-3.5" /> Ingredient List
                </Button>
                <Button size="sm" onClick={() => updateStatus(b.id, 'completed')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Mark Completed
                </Button>
              </>
            )}
            {b.status === 'completed' && (
              <Button size="sm" onClick={() => markPaid(b)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Mark as Paid & Send Invoice
              </Button>
            )}
            <Button
              size="sm"
              variant={openChatId === b.id ? 'default' : 'outline'}
              onClick={() => setOpenChatId(openChatId === b.id ? null : b.id)}
              className="gap-1 ml-auto"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              {openChatId === b.id ? 'Close Chat' : 'Chat'}
            </Button>
          </div>

          {openChatId === b.id && cookUser && (
            <BookingChatPanel booking={b} user={cookUser} role="cook" />
          )}
        </div>
      ))}

      {/* Quote Modal */}
      {selectedBooking && (
        <Dialog open onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-playfair text-xl">Send a Quote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Dishes: {selectedBooking.dishes?.map(d => `${d.name} ×${d.servings}`).join(', ')}
              </p>
              <div>
                <Label>Your Quoted Price ($)</Label>
                <Input type="number" min={0} value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)} placeholder="e.g. 120" />
              </div>
              <div>
                <Label>Notes to Customer</Label>
                <Textarea value={cookNotes} onChange={e => setCookNotes(e.target.value)} placeholder="Include transport details, timing, anything they should know…" rows={3} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedBooking(null)}>Cancel</Button>
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-white" onClick={sendQuote} disabled={!quoteAmount}>
                  Send Quote
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {ingredientBooking && (
        <IngredientListModal
          booking={ingredientBooking}
          onClose={() => setIngredientBooking(null)}
        />
      )}
    </div>
  );
}