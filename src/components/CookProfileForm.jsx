import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function CookProfileForm({ user, existing, onSaved }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    location_address: '',
    base_rate_per_dish: '',
    transport_fee: '',
    years_experience: '',
    cuisines: [],
    specialties: [],
  });
  const [newCuisine, setNewCuisine] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({
        display_name: existing.display_name || '',
        bio: existing.bio || '',
        location_address: existing.location_address || '',
        base_rate_per_dish: existing.base_rate_per_dish || '',
        transport_fee: existing.transport_fee || '',
        years_experience: existing.years_experience || '',
        cuisines: existing.cuisines || [],
        specialties: existing.specialties || [],
      });
    }
  }, [existing]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTag = (field, val, setVal) => {
    const trimmed = val.trim();
    if (trimmed && !form[field].includes(trimmed)) {
      update(field, [...form[field], trimmed]);
    }
    setVal('');
  };

  const removeTag = (field, val) => update(field, form[field].filter(v => v !== val));

  const detectLocation = () => {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          update('location_address', data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          update('location_address', `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };

  const save = async () => {
    setSaving(true);
    const data = {
      ...form,
      user_email: user.email,
      base_rate_per_dish: parseFloat(form.base_rate_per_dish) || 0,
      transport_fee: parseFloat(form.transport_fee) || 0,
      years_experience: parseInt(form.years_experience) || 0,
    };
    let saved;
    if (existing) {
      saved = await base44.entities.CookProfile.update(existing.id, data);
    } else {
      saved = await base44.entities.CookProfile.create(data);
    }
    onSaved(saved);
    toast({ title: 'Profile saved!' });
    setSaving(false);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Display Name *</Label>
          <Input value={form.display_name} onChange={e => update('display_name', e.target.value)} placeholder="How customers will see you" />
        </div>
        <div>
          <Label>Years of Experience</Label>
          <Input type="number" min={0} value={form.years_experience} onChange={e => update('years_experience', e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Bio</Label>
        <Textarea value={form.bio} onChange={e => update('bio', e.target.value)} placeholder="Tell customers about your cooking style, favourite dishes, and passion…" rows={3} />
      </div>

      {/* Location */}
      <div>
        <Label>Your Base Location</Label>
        <div className="flex gap-2">
          <Input
            value={form.location_address}
            onChange={e => update('location_address', e.target.value)}
            placeholder="Your city / neighbourhood"
            className="flex-1"
          />
          <Button variant="outline" onClick={detectLocation} disabled={geoLoading} className="gap-2">
            <MapPin className="w-4 h-4" />
            {geoLoading ? 'Detecting…' : 'Detect'}
          </Button>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Base Rate per Dish ($)</Label>
          <Input type="number" min={0} value={form.base_rate_per_dish} onChange={e => update('base_rate_per_dish', e.target.value)} placeholder="e.g. 20" />
        </div>
        <div>
          <Label>Transport Fee ($)</Label>
          <Input type="number" min={0} value={form.transport_fee} onChange={e => update('transport_fee', e.target.value)} placeholder="e.g. 10" />
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <Label>Cuisines You Cook</Label>
        <div className="flex gap-2 mb-2">
          <Input value={newCuisine} onChange={e => setNewCuisine(e.target.value)} placeholder="e.g. West African" onKeyDown={e => e.key === 'Enter' && addTag('cuisines', newCuisine, setNewCuisine)} />
          <Button variant="outline" onClick={() => addTag('cuisines', newCuisine, setNewCuisine)}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.cuisines.map((c, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {c}
              <button onClick={() => removeTag('cuisines', c)}><X className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Specialties */}
      <div>
        <Label>Specialties / Signature Dishes</Label>
        <div className="flex gap-2 mb-2">
          <Input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="e.g. Suya, Egusi Soup" onKeyDown={e => e.key === 'Enter' && addTag('specialties', newSpecialty, setNewSpecialty)} />
          <Button variant="outline" onClick={() => addTag('specialties', newSpecialty, setNewSpecialty)}><Plus className="w-4 h-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.specialties.map((s, i) => (
            <Badge key={i} className="gap-1 bg-primary/10 text-primary border-primary/20">
              {s}
              <button onClick={() => removeTag('specialties', s)}><X className="w-3 h-3" /></button>
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={save} disabled={saving || !form.display_name} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base rounded-xl">
        {saving ? 'Saving…' : existing ? 'Update Profile' : 'Create Cook Profile'}
      </Button>
    </div>
  );
}