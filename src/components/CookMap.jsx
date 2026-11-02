import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin } from 'lucide-react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const cookIcon = new L.DivIcon({
  html: `<div style="background:#2d6a4f;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);">🍳</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

const userIcon = new L.DivIcon({
  html: `<div style="background:#e07b39;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);">📍</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// miles to meters
const milesToMeters = (miles) => miles * 1609.34;

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true });
  }, [center, zoom]);
  return null;
}

export default function CookMap({ cooks, userLocation, radiusMiles, onSelectCook, selectedCook }) {
  const defaultCenter = userLocation || [51.505, -0.09]; // Default: London
  const zoom = radiusMiles <= 5 ? 12 : radiusMiles <= 10 ? 11 : 10;

  const visibleCooks = cooks.filter(c => c.location_lat && c.location_lng);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={userLocation || defaultCenter} zoom={zoom} />

        {/* User location + radius circle */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <p className="font-semibold text-sm">Your location</p>
                <p className="text-xs text-gray-500">Showing cooks within {radiusMiles} miles</p>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={milesToMeters(radiusMiles)}
              pathOptions={{
                color: '#e07b39',
                fillColor: '#e07b39',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '6 4',
              }}
            />
          </>
        )}

        {/* Cook markers */}
        {visibleCooks.map(cook => (
          <Marker
            key={cook.id}
            position={[cook.location_lat, cook.location_lng]}
            icon={cookIcon}
            eventHandlers={{ click: () => onSelectCook(cook) }}
          >
            <Popup>
              <div className="min-w-[160px]">
                <p className="font-semibold text-sm text-gray-800">{cook.display_name}</p>
                {cook.location_address && (
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{cook.location_address}
                  </p>
                )}
                {cook.rating && (
                  <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />{cook.rating.toFixed(1)} ({cook.total_reviews} reviews)
                  </p>
                )}
                {cook.cuisines?.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">{cook.cuisines.slice(0, 3).join(', ')}</p>
                )}
                {cook.base_rate_per_dish && (
                  <p className="text-xs font-semibold text-green-700 mt-1">From £{cook.base_rate_per_dish}/dish</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}