import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function IngredientListModal({ booking, onClose }) {
  const { toast } = useToast();
  const [existing, setExisting] = useState(null);
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '', notes: '' }]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.IngredientList.filter({ booking_request_id: booking.id }).then(data => {
      if (data[0]) {
        setExisting(data[0]);
        setIngredients(data[0].ingredients || [{ name: '', quantity: '', unit: '', notes: '' }]);
        setGeneralNotes(data[0].general_notes || '');
      }
    });
  }, [booking.id]);

  const updateIngredient = (i, k, v) =>
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [k]: v } : ing));

  const addRow = () => setIngredients(prev => [...prev, { name: '', quantity: '', unit: '', notes: '' }]);
  const removeRow = (i) => setIngredients(prev => prev.filter((_, idx) => idx !== i));

  const save = async () => {
    setSaving(true);
    const data = {
      booking_request_id: booking.id,
      cook_email: booking.cook_email,
      customer_email: booking.customer_email,
      ingredients,
      general_notes: generalNotes,
    };
    if (existing) {
      await base44.entities.IngredientList.update(existing.id, data);
    } else {
      await base44.entities.IngredientList.create(data);
    }
    toast({ title: 'Ingredient list saved and shared with customer!' });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Ingredient List
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          This list will be shared with <strong>{booking.customer_name || booking.customer_email}</strong> so they can shop before you arrive.
        </p>

        <div className="space-y-3 mt-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="bg-muted rounded-xl p-3 space-y-2">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={e => updateIngredient(i, 'name', e.target.value)}
                  className="flex-1"
                />
                {ingredients.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-destructive hover:opacity-70">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Qty" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} />
                <Input placeholder="Unit (kg, pcs…)" value={ing.unit} onChange={e => updateIngredient(i, 'unit', e.target.value)} />
                <Input placeholder="Notes" value={ing.notes} onChange={e => updateIngredient(i, 'notes', e.target.value)} />
              </div>
            </div>
          ))}

          <Button variant="outline" className="w-full" onClick={addRow}>
            <Plus className="w-4 h-4 mr-2" /> Add Ingredient
          </Button>

          <div>
            <Label>General Notes for Customer</Label>
            <Textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} placeholder="e.g. Please get fresh tomatoes, avoid pre-packaged sauces…" rows={2} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save & Share List'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}