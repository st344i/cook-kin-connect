import { MapPin, Star, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO, isAfter, startOfDay } from 'date-fns';

export default function CookCard({ cook, onBook }) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image / Avatar */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
        {cook.profile_image ? (
          <img src={cook.profile_image} alt={cook.display_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center text-3xl font-playfair font-bold text-primary">
            {cook.display_name?.charAt(0)}
          </div>
        )}
        {cook.is_available && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Available
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-playfair text-lg font-bold text-foreground">{cook.display_name}</h3>
          {cook.rating ? (
            <div className="flex items-center gap-1 text-sm text-amber-500 font-semibold">
              <Star className="w-4 h-4 fill-amber-500" />
              {cook.rating.toFixed(1)}
              <span className="text-muted-foreground font-normal text-xs">({cook.total_reviews ?? 0})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
              <Star className="w-3.5 h-3.5" />
              <span>No reviews</span>
            </div>
          )}
        </div>

        {cook.location_address && (
          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{cook.location_address}</span>
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{cook.bio || 'Passionate home cook ready to bring flavour to your table.'}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {cook.cuisines?.slice(0, 3).map((c, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{c}</Badge>
          ))}
          {cook.specialties?.slice(0, 2).map((s, i) => (
            <Badge key={i} className="text-xs bg-primary/10 text-primary border-primary/20">{s}</Badge>
          ))}
        </div>

        {/* Upcoming available dates */}
        {cook.available_dates?.length > 0 && (() => {
          const today = startOfDay(new Date());
          const upcoming = cook.available_dates
            .filter(d => isAfter(parseISO(d), today) || format(today, 'yyyy-MM-dd') === d)
            .slice(0, 3);
          return upcoming.length > 0 ? (
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {upcoming.map(d => (
                <span key={d} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                  {format(parseISO(d), 'MMM d')}
                </span>
              ))}
              {cook.available_dates.filter(d => isAfter(parseISO(d), today)).length > 3 && (
                <span className="text-xs text-muted-foreground">+more</span>
              )}
            </div>
          ) : null;
        })()}

        <div className="flex items-center justify-between">
          <div>
            {cook.base_rate_per_dish && (
              <p className="text-sm text-muted-foreground">From <span className="font-bold text-foreground">${cook.base_rate_per_dish}</span>/dish</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={onBook}
            disabled={!cook.is_available}
            className="bg-accent hover:bg-accent/90 text-white rounded-lg"
          >
            {cook.is_available ? 'Request Cook' : 'Unavailable'}
          </Button>
        </div>
      </div>
    </div>
  );
}