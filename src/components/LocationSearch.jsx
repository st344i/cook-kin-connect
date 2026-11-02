import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';

export default function LocationSearch({ onLocationSelect, placeholder = "Search street, postcode or area…", className = "" }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (q) => {
    setQuery(q);
    if (!q || q.length < 3) { setResults([]); setOpen(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      setResults(data);
      setOpen(true);
      setLoading(false);
    }, 400);
  };

  const select = (item) => {
    setQuery(item.display_name.split(',').slice(0, 2).join(','));
    setOpen(false);
    setResults([]);
    onLocationSelect({ lat: parseFloat(item.lat), lng: parseFloat(item.lon), label: item.display_name });
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    onLocationSelect(null);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {loading && <div className="px-4 py-3 text-sm text-muted-foreground">Searching…</div>}
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => select(item)}
              className="flex items-start gap-2 w-full px-4 py-3 text-left hover:bg-muted transition-colors text-sm border-b border-border last:border-0"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-foreground line-clamp-2">{item.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}