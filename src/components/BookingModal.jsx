import { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChefHat, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LocationSearch from '@/components/LocationSearch';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';

export default function BookingModal({ cook, user, onClose }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: user?.full_name || '',
    customer_address: '',
    customer_lat: null,
    customer_lng: null,
    requested_date: '',
    requested_time: '',
    number_of_people: 2,
    special_requests: '',
  });
  const [dishes, setDishes] = useState([{ name: '', servings: 2, notes: '' }]);

  const updateField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updateDish = (i, k, v) => setDishes(d => d.map((dish, idx) => idx === i ? { ...dish, [k]: v } : dish));
  const addDish = () => setDishes(d => [...d, { name: '', servings: 2, notes: '' }]);
  const removeDish = (i) => setDishes(d => d.filter((_, idx) => idx !== i));

  // Build available date set and slot map from cook profile
  const today = startOfDay(new Date());
  const availableDateSet = useMemo(() => {
    const dates = (cook.available_dates || []).filter(d => !isBefore(parseISO(d), today));
    return new Set(dates);
  }, [cook.available_dates]);

  const slotMap = useMemo(() => {
    const map = {};
    (cook.available_slots || []).forEach(s => { map[s.date] = s.times || []; });
    return map;
  }, [cook.available_slots]);

  const hasAvailability = availableDateSet.size > 0;
  const hasSlots = form.requested_date && (slotMap[form.requested_date] || []).length > 0;
  const availableTimesForDate = form.requested_date ? (slotMap[form.requested_date] || []) : [];

  const handleDateSelect = (dateStr) => {
    updateField('requested_date', dateStr);
    updateField('requested_time', ''); // reset time when date changes
  };

  const submit = async () => {
    setLoading(true);
    await base44.entities.BookingRequest.create({
      customer_email: user.email,
      cook_email: cook.user_email,
      cook_profile_id: cook.id,
      ...form,
      dishes,
      status: 'pending',
    });
    setLoading(false);
    toast({ title: 'Booking request sent!', description: `${cook.display_name} will review and send you a quote.` });
    onClose();
  };

  // Sorted upcoming available dates for display
  const sortedDates = useMemo(() => {
    return [...availableDateSet].sort();
  }, [availableDateSet]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-accent" />
            Book {cook.display_name}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label>Your Name</Label>
              <Input value={form.customer_name} onChange={e => updateField('customer_name', e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label>Your Address (where cook should come)</Label>
              <LocationSearch
                placeholder="Search your street, postcode or area…"
                onLocationSelect={(loc) => {
                  if (loc) {
                    updateField('customer_address', loc.label.split(',').slice(0, 3).join(','));
                    setForm(f => ({ ...f, customer_lat: loc.lat, customer_lng: loc.lng }));
                  } else {
                    setForm(f => ({ ...f, customer_address: '', customer_lat: null, customer_lng: null }));
                  }
                }}
              />
              {form.customer_address && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{form.customer_address}</p>
              )}
            </div>

            {/* Date Selection */}
            <div>
              <Label className="flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5" /> Select a Date
              </Label>

              {!hasAvailability ? (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>This cook hasn't set any upcoming available dates yet. You can still send a request and they'll confirm a date with you.</span>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {sortedDates.map(dateStr => {
                    const isSelected = form.requested_date === dateStr;
                    const slotCount = (slotMap[dateStr] || []).length;
                    return (
                      <button
                        key={dateStr}
                        onClick={() => handleDateSelect(dateStr)}
                        className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all text-left
                          ${isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:border-primary hover:text-primary'
                          }`}
                      >
                        <div>{format(parseISO(dateStr), 'EEE, d MMM')}</div>
                        {slotCount > 0 && (
                          <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {slotCount} slot{slotCount !== 1 ? 's' : ''}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Fallback free-text date if cook has no availability */}
              {!hasAvailability && (
                <div className="mt-2">
                  <Input
                    type="date"
                    value={form.requested_date}
                    onChange={e => handleDateSelect(e.target.value)}
                    min={format(today, 'yyyy-MM-dd')}
                    placeholder="Choose a date"
                  />
                </div>
              )}
            </div>

            {/* Time Selection */}
            {form.requested_date && (
              <div>
                <Label className="flex items-center gap-1.5 mb-2">
                  <Clock className="w-3.5 h-3.5" /> Select a Time
                </Label>
                {hasSlots ? (
                  <div className="flex flex-wrap gap-2">
                    {availableTimesForDate.map(t => (
                      <button
                        key={t}
                        onClick={() => updateField('requested_time', t)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
                          ${form.requested_time === t
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:border-primary hover:text-primary'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Input
                    type="time"
                    value={form.requested_time}
                    onChange={e => updateField('requested_time', e.target.value)}
                  />
                )}
              </div>
            )}

            <div>
              <Label>Number of People</Label>
              <Input type="number" min={1} value={form.number_of_people} onChange={e => updateField('number_of_people', parseInt(e.target.value))} />
            </div>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setStep(2)}
              disabled={!form.customer_name || !form.customer_address || !form.requested_date}
            >
              Next: Add Dishes →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 shrink-0 text-primary" />
              <span>
                <strong className="text-foreground">{format(parseISO(form.requested_date), 'EEE, d MMMM yyyy')}</strong>
                {form.requested_time && <> at <strong className="text-foreground">{form.requested_time}</strong></>}
              </span>
            </div>

            <p className="text-sm text-muted-foreground">List the dishes you'd like. The cook will review and send a quote.</p>
            {dishes.map((dish, i) => (
              <div key={i} className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Dish name (e.g. Jollof Rice)"
                    value={dish.name}
                    onChange={e => updateDish(i, 'name', e.target.value)}
                    className="flex-1"
                  />
                  {dishes.length > 1 && (
                    <button onClick={() => removeDish(i)} className="text-destructive hover:opacity-70">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="Servings"
                    value={dish.servings}
                    onChange={e => updateDish(i, 'servings', parseInt(e.target.value))}
                    className="w-32"
                  />
                  <Input
                    placeholder="Notes (e.g. no pepper)"
                    value={dish.notes}
                    onChange={e => updateDish(i, 'notes', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addDish}>
              <Plus className="w-4 h-4 mr-2" /> Add Another Dish
            </Button>
            <div>
              <Label>Any special requests?</Label>
              <Textarea
                value={form.special_requests}
                onChange={e => updateField('special_requests', e.target.value)}
                placeholder="Dietary needs, allergies, occasion details…"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>← Back</Button>
              <Button className="flex-1 bg-accent hover:bg-accent/90 text-white" onClick={submit} disabled={loading || !dishes[0].name}>
                {loading ? 'Sending…' : 'Send Request'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}