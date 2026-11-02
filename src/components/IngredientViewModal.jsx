import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart } from 'lucide-react';

export default function IngredientViewModal({ booking, onClose }) {
  const [list, setList] = useState(null);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    base44.entities.IngredientList.filter({ booking_request_id: booking.id }).then(data => {
      if (data[0]) {
        setList(data[0]);
        const init = {};
        data[0].ingredients?.forEach((_, i) => { init[i] = false; });
        setChecked(init);
      }
    });
  }, [booking.id]);

  const toggle = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-accent" />
            Shopping List
          </DialogTitle>
        </DialogHeader>

        {!list ? (
          <p className="text-muted-foreground text-sm py-4">The cook hasn't added the ingredient list yet. Check back soon!</p>
        ) : (
          <div className="space-y-3 mt-2">
            {list.ingredients?.map((ing, i) => (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked[i] ? 'bg-green-50 border-green-200 opacity-60' : 'bg-card border-border hover:bg-muted'
                }`}
              >
                <Checkbox checked={!!checked[i]} onCheckedChange={() => toggle(i)} />
                <div className="flex-1">
                  <p className={`font-medium text-sm ${checked[i] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {ing.name}
                  </p>
                  {(ing.quantity || ing.unit) && (
                    <p className="text-xs text-muted-foreground">{ing.quantity} {ing.unit}</p>
                  )}
                  {ing.notes && <p className="text-xs text-muted-foreground italic">{ing.notes}</p>}
                </div>
              </div>
            ))}

            {list.general_notes && (
              <div className="bg-muted rounded-xl p-3 mt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Cook's Notes:</p>
                <p className="text-sm text-foreground">{list.general_notes}</p>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground pt-2">
              {Object.values(checked).filter(Boolean).length} / {list.ingredients?.length} items checked
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}