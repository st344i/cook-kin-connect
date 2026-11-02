import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ReviewModal({ booking, user, onClose, onSubmitted }) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setSubmitting(true);

    // Create review record
    await base44.entities.Review.create({
      booking_request_id: booking.id,
      cook_profile_id: booking.cook_profile_id,
      reviewer_email: user.email,
      reviewer_name: user.full_name || user.email,
      rating,
      comment,
    });

    // Recalculate cook's average rating
    const allReviews = await base44.entities.Review.filter({ cook_profile_id: booking.cook_profile_id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await base44.entities.CookProfile.update(booking.cook_profile_id, {
      rating: Math.round(avg * 10) / 10,
      total_reviews: allReviews.length,
    });

    toast({ title: 'Review submitted! Thank you for your feedback.' });
    setSubmitting(false);
    onSubmitted();
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">Leave a Review</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">How was your experience with this cook?</p>

        {/* Star picker */}
        <div className="flex items-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  n <= (hovered || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
            </span>
          )}
        </div>

        <Textarea
          placeholder="Tell others about your experience (optional)…"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
        />

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-white"
            onClick={submit}
            disabled={!rating || submitting}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}