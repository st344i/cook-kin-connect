import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, X, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay } from 'date-fns';

const PRESET_TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function AvailabilityCalendar({ profile, onSaved }) {
  const { toast } = useToast();
  const [current, setCurrent] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [editingDate, setEditingDate] = useState(null); // dateStr being edited for time slots
  const [customTime, setCustomTime] = useState('');

  // slots: { [dateStr]: Set<timeStr> }
  const initSlots = () => {
    const map = {};
    (profile.available_slots || []).forEach(s => {
      map[s.date] = new Set(s.times || []);
    });
    // also seed from old available_dates that have no slots
    (profile.available_dates || []).forEach(d => {
      if (!map[d]) map[d] = new Set();
    });
    return map;
  };
  const [slots, setSlots] = useState(initSlots);

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const selectedDates = new Set(Object.keys(slots));

  const toggleDay = (dateStr, isPast) => {
    if (isPast) return;
    setSlots(prev => {
      const next = { ...prev };
      if (next[dateStr]) {
        delete next[dateStr];
        if (editingDate === dateStr) setEditingDate(null);
      } else {
        next[dateStr] = new Set();
        setEditingDate(dateStr);
      }
      return next;
    });
  };

  const toggleTime = (dateStr, time) => {
    setSlots(prev => {
      const next = { ...prev };
      const times = new Set(next[dateStr] || []);
      times.has(time) ? times.delete(time) : times.add(time);
      next[dateStr] = times;
      return next;
    });
  };

  const addCustomTime = () => {
    if (!customTime || !editingDate) return;
    toggleTime(editingDate, customTime);
    setCustomTime('');
  };

  const save = async () => {
    setSaving(true);
    const available_dates = Object.keys(slots).sort();
    const available_slots = available_dates.map(date => ({
      date,
      times: [...(slots[date] || [])].sort(),
    }));
    await base44.entities.CookProfile.update(profile.id, { available_dates, available_slots });
    onSaved(prev => ({ ...prev, available_dates, available_slots }));
    toast({ title: 'Availability saved!' });
    setSaving(false);
  };

  const clearAll = () => {
    setSlots({});
    setEditingDate(null);
  };

  const editingSlotSet = editingDate ? (slots[editingDate] || new Set()) : new Set();

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-xl font-semibold text-foreground">Availability Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCurrent(subMonths(current, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground w-28 text-center">
            {format(current, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrent(addMonths(current, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">Click a date to mark it available, then set your time slots for that day.</p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startPadding }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isPast = isBefore(day, today);
          const isSelected = selectedDates.has(dateStr);
          const isEditing = editingDate === dateStr;
          const slotCount = slots[dateStr]?.size || 0;

          return (
            <button
              key={dateStr}
              onClick={() => toggleDay(dateStr, isPast)}
              disabled={isPast}
              className={`
                relative aspect-square rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center
                ${isPast ? 'text-muted-foreground/30 cursor-not-allowed' : 'hover:bg-primary/10 cursor-pointer'}
                ${isEditing ? 'ring-2 ring-accent bg-primary text-primary-foreground' : ''}
                ${isSelected && !isEditing ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                ${!isSelected && !isPast ? 'text-foreground' : ''}
              `}
            >
              {format(day, 'd')}
              {isSelected && slotCount > 0 && (
                <span className="absolute bottom-0.5 text-[8px] opacity-70">{slotCount}t</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary inline-block" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-accent inline-block" /> Editing</span>
        </div>
        <span>{selectedDates.size} date{selectedDates.size !== 1 ? 's' : ''} selected</span>
      </div>

      {/* Time Slot Editor */}
      {editingDate && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Time slots for {format(new Date(editingDate + 'T00:00:00'), 'EEE, d MMM')}
              </span>
            </div>
            <button onClick={() => setEditingDate(null)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground">Select your available start times (or leave empty to accept any time).</p>

          {/* Preset time chips */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TIMES.map(t => {
              const active = editingSlotSet.has(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTime(editingDate, t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                    ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:border-primary hover:text-primary'}`}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Custom time */}
          <div className="flex gap-2">
            <input
              type="time"
              value={customTime}
              onChange={e => setCustomTime(e.target.value)}
              className="flex h-8 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button size="sm" variant="outline" onClick={addCustomTime} disabled={!customTime}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>

          {editingSlotSet.size === 0 && (
            <p className="text-xs text-muted-foreground italic">No times selected — any time will be accepted for this date.</p>
          )}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">Clear all</Button>
        <Button size="sm" onClick={save} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {saving ? 'Saving…' : 'Save Availability'}
        </Button>
      </div>
    </div>
  );
}