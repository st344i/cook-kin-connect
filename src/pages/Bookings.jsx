import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, DollarSign, ChefHat, ShoppingCart, CheckCircle, MessageCircle, BadgeCheck, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import IngredientViewModal from '@/components/IngredientViewModal';
import BookingChatPanel from '@/components/BookingChatPanel';
import ReviewModal from '@/components/ReviewModal';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  quoted: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function Bookings() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ingredientBooking, setIngredientBooking] = useState(null);
  const [openChatId, setOpenChatId] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const load = async (u) => {
    const data = await base44.entities.BookingRequest.filter({ customer_email: u.email }, '-created_date');
    setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      load(u);
      // Load which bookings this user already reviewed
      const reviews = await base44.entities.Review.filter({ reviewer_email: u.email });
      setReviewedIds(new Set(reviews.map(r => r.booking_request_id)));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const acceptQuote = async (booking) => {
    await base44.entities.BookingRequest.update(booking.id, {
      status: 'accepted',
      customer_accepted_quote: true,
      final_price: booking.quoted_price,
    });
    toast({ title: 'Quote accepted! The cook has been notified.' });
    load(user);
  };

  const cancelBooking = async (id) => {
    await base44.entities.BookingRequest.update(id, { status: 'cancelled' });
    toast({ title: 'Booking cancelled.' });
    load(user);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-3xl font-bold text-white mb-1">My Bookings</h1>
          <p className="text-white/50 text-sm">Track your cooking requests and manage your meals.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-24">
            <ChefHat className="w-14 h-14 mx-auto mb-4 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground text-lg">No bookings yet.</p>
            <p className="text-muted-foreground text-sm mt-1">Browse and request a cook to get started!</p>
          </div>
        ) : (
          bookings.map(b => (
            <div key={b.id} className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">Cook: {b.cook_email}</p>
                  <p className="text-sm text-muted-foreground">{b.customer_address}</p>
                </div>
                <Badge className={`${statusColors[b.status]} border text-xs font-semibold capitalize`}>{b.status}</Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {b.requested_date} {b.requested_time}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.number_of_people} people</span>
                {b.final_price && <span className="flex items-center gap-1 text-accent font-semibold"><DollarSign className="w-3.5 h-3.5" /> ${b.final_price} agreed</span>}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {b.dishes?.map((d, i) => (
                  <span key={i} className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-lg">{d.name} ×{d.servings}</span>
                ))}
              </div>

              {/* Paid confirmation */}
              {b.status === 'paid' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                  <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Payment Confirmed — Invoice Sent!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">A PDF invoice has been emailed to {b.customer_email}.</p>
                  </div>
                </div>
              )}

              {/* Quote from cook */}
              {b.status === 'quoted' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Cook's Quote: ${b.quoted_price}
                  </p>
                  {b.cook_notes && <p className="text-xs text-blue-700 italic">"{b.cook_notes}"</p>}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {b.status === 'quoted' && (
                  <>
                    <Button size="sm" onClick={() => acceptQuote(b)} className="bg-green-600 hover:bg-green-700 text-white gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Accept Quote
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => cancelBooking(b.id)} className="text-destructive border-destructive/30">
                      Decline
                    </Button>
                  </>
                )}
                {b.status === 'accepted' && (
                  <Button size="sm" variant="outline" onClick={() => setIngredientBooking(b)} className="gap-1">
                    <ShoppingCart className="w-3.5 h-3.5" /> View Shopping List
                  </Button>
                )}
                {(b.status === 'completed' || b.status === 'paid') && (
                  reviewedIds.has(b.id) ? (
                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium px-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Reviewed
                    </span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => setReviewBooking(b)} className="gap-1 border-amber-300 text-amber-600 hover:bg-amber-50">
                      <Star className="w-3.5 h-3.5" /> Leave a Review
                    </Button>
                  )
                )}
                {(b.status === 'pending' || b.status === 'quoted') && (
                  <Button size="sm" variant="ghost" onClick={() => cancelBooking(b.id)} className="text-muted-foreground">
                    Cancel
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

              {openChatId === b.id && user && (
                <BookingChatPanel booking={b} user={user} role="customer" />
              )}
            </div>
          ))
        )}
      </div>

      {ingredientBooking && (
        <IngredientViewModal booking={ingredientBooking} onClose={() => setIngredientBooking(null)} />
      )}

      {reviewBooking && user && (
        <ReviewModal
          booking={reviewBooking}
          user={user}
          onClose={() => setReviewBooking(null)}
          onSubmitted={() => setReviewedIds(prev => new Set([...prev, reviewBooking.id]))}
        />
      )}
    </div>
  );
}