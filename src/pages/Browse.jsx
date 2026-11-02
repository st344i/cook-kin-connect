import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, ChefHat, Map, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CookCard from '@/components/CookCard';
import BookingModal from '@/components/BookingModal';
import LocationSearch from '@/components/LocationSearch';
import CookMapView from '@/components/CookMapView';

const RADIUS_OPTIONS = [5, 10, 15, 20, 25];

const DIETARY_FILTERS = [
  { label: 'Vegan', emoji: '🌱' },
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'Gluten-Free', emoji: '🌾' },
  { label: 'Halal', emoji: '☪️' },
  { label: 'Kosher', emoji: '✡️' },
  { label: 'Dairy-Free', emoji: '🥛' },
  { label: 'Nut-Free', emoji: '🥜' },
  { label: 'Keto', emoji: '🥩' },
];

function getDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Browse() {
  const [cooks, setCooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCook, setSelectedCook] = useState(null);
  const [user, setUser] = useState(null);
  const [searchLocation, setSearchLocation] = useState(null);
  const [radiusMiles, setRadiusMiles] = useState(10);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [activeFilters, setActiveFilters] = useState(() => {
    // Support pre-selecting a filter via URL param ?filter=Vegan
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    return f ? new Set([f]) : new Set();
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.CookProfile.list('-created_date', 100).then(data => {
      setCooks(data);
      setLoading(false);
    });
  }, []);

  const toggleFilter = (label) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = cooks;

    // Text search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.display_name?.toLowerCase().includes(q) ||
        c.location_address?.toLowerCase().includes(q) ||
        c.cuisines?.some(cu => cu.toLowerCase().includes(q)) ||
        c.specialties?.some(s => s.toLowerCase().includes(q))
      );
    }

    // Dietary / specialty filters
    if (activeFilters.size > 0) {
      list = list.filter(c => {
        const allTags = [...(c.specialties || []), ...(c.cuisines || [])].map(t => t.toLowerCase());
        return [...activeFilters].every(f => allTags.some(t => t.includes(f.toLowerCase())));
      });
    }

    // Location radius filter
    if (searchLocation) {
      list = list.filter(c => {
        if (!c.location_lat || !c.location_lng) return false;
        const dist = getDistanceMiles(searchLocation.lat, searchLocation.lng, c.location_lat, c.location_lng);
        return dist <= radiusMiles;
      });
    }

    return list;
  }, [search, cooks, searchLocation, radiusMiles, activeFilters]);

  const handleBook = (cook) => {
    if (!user) {
      base44.auth.redirectToLogin();
    } else {
      setSelectedCook(cook);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-foreground py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-4xl font-bold text-white mb-2 text-center">Find Your Cook</h1>
          <p className="text-white/50 mb-6 text-center text-sm">Browse home cooks near you and request a personalised meal.</p>

          {/* Text search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              placeholder="Search by name, cuisine, specialty…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Location search */}
          <LocationSearch
            placeholder="Search street, postcode or area to filter by distance…"
            onLocationSelect={setSearchLocation}
            className="mb-3"
          />

          {/* Radius selector — only shown when location selected */}
          {searchLocation && (
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
              <SlidersHorizontal className="w-4 h-4 text-white/60 shrink-0" />
              <span className="text-white/70 text-sm shrink-0">Radius:</span>
              <div className="flex gap-2 flex-wrap">
                {RADIUS_OPTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setRadiusMiles(r)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      radiusMiles === r
                        ? 'bg-primary text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {r} mi
                  </button>
                ))}
              </div>
              {searchLocation && (
                <span className="ml-auto text-white/50 text-xs shrink-0">
                  Near {searchLocation.label.split(',')[0]}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dietary / Specialty filter strip */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-xs font-semibold text-muted-foreground shrink-0 uppercase tracking-wide">Filter:</span>
          {DIETARY_FILTERS.map(({ label, emoji }) => {
            const active = activeFilters.has(label);
            return (
              <button
                key={label}
                onClick={() => toggleFilter(label)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all shrink-0
                  ${active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background border-border text-foreground hover:border-primary hover:text-primary'
                  }`}
              >
                <span>{emoji}</span> {label}
                {active && <X className="w-3 h-3 ml-0.5 opacity-70" />}
              </button>
            );
          })}
          {activeFilters.size > 0 && (
            <button
              onClick={() => setActiveFilters(new Set())}
              className="ml-auto shrink-0 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {loading ? 'Loading…' : `${filtered.length} cook${filtered.length !== 1 ? 's' : ''} found`}
          {searchLocation && !loading && ` within ${radiusMiles} miles`}
        </p>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-card shadow text-foreground' : 'text-muted-foreground'}`}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <ChefHat className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No cooks found.</p>
            <p className="text-muted-foreground text-sm mt-1">
              {searchLocation ? `Try increasing the radius or searching a different area.` : `Try a different search.`}
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <CookMapView
            searchLocation={searchLocation}
            radiusMiles={radiusMiles}
            cooks={filtered}
            onCookSelect={handleBook}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(cook => (
              <CookCard key={cook.id} cook={cook} onBook={() => handleBook(cook)} />
            ))}
          </div>
        )}
      </div>

      {selectedCook && (
        <BookingModal cook={selectedCook} user={user} onClose={() => setSelectedCook(null)} />
      )}
    </div>
  );
}