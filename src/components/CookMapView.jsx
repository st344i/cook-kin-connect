import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const cookIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#2d6a4f;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:16px;">🍳</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const searchIcon = new L.DivIcon({
  className: '',
  html: `<div style="background:#f4845f;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);font-size:18px;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function CookMapView({ searchLocation, radiusMiles, cooks, onCookSelect }) {
  const radiusMeters = radiusMiles * 1609.34;
  const defaultCenter = [51.505, -0.09]; // London default
  const center = searchLocation ? [searchLocation.lat, searchLocation.lng] : defaultCenter;

  return (
    <div className="rounded-2xl overflow-hidden border border-border" style={{ height: '420px' }}>
      <MapContainer center={center} zoom={searchLocation ? 11 : 6} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {searchLocation && (
          <>
            <RecenterMap center={center} zoom={11} />
            <Marker position={center} icon={searchIcon}>
              <Popup>Your search location</Popup>
            </Marker>
            <Circle
              center={center}
              radius={radiusMeters}
              pathOptions={{ color: '#2d6a4f', fillColor: '#2d6a4f', fillOpacity: 0.08, weight: 2 }}
            />
          </>
        )}
        {cooks.filter(c => c.location_lat && c.location_lng).map(cook => (
          <Marker
            key={cook.id}
            position={[cook.location_lat, cook.location_lng]}
            icon={cookIcon}
            eventHandlers={{ click: () => onCookSelect && onCookSelect(cook) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{cook.display_name}</p>
                <p className="text-gray-500 text-xs">{cook.location_address}</p>
                {cook.base_rate_per_dish && <p className="text-green-700 text-xs mt-1">From £{cook.base_rate_per_dish}/dish</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}