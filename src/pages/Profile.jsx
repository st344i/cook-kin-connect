import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { User, Mail, Star, ChefHat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [cookProfile, setCookProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      setUser(u);
      const profiles = await base44.entities.CookProfile.filter({ user_email: u.email });
      setCookProfile(profiles[0] || null);
      setLoading(false);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground py-14 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-accent/30 flex items-center justify-center text-4xl font-playfair font-bold text-accent mx-auto mb-4">
            {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
          </div>
          <h1 className="font-playfair text-3xl font-bold text-white">{user?.full_name || user?.email}</h1>
          <p className="text-white/50 mt-1">{user?.email}</p>
          {cookProfile && (
            <div className="inline-flex items-center gap-2 mt-3 bg-primary/30 border border-primary/40 rounded-full px-4 py-1.5">
              <ChefHat className="w-4 h-4 text-primary-foreground" />
              <span className="text-primary-foreground text-sm font-medium">Registered Cook</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Account Info */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-playfair text-lg font-bold mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{user?.full_name}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Cook Profile Summary */}
        {cookProfile && (
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="font-playfair text-lg font-bold mb-4">Your Cook Profile</h2>
            <div className="space-y-3">
              {cookProfile.bio && <p className="text-muted-foreground text-sm">{cookProfile.bio}</p>}
              <div className="flex flex-wrap gap-1">
                {cookProfile.cuisines?.map((c, i) => (
                  <Badge key={i} variant="secondary">{c}</Badge>
                ))}
              </div>
              {cookProfile.rating && (
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <Star className="w-4 h-4 fill-amber-500" />
                  {cookProfile.rating.toFixed(1)} ({cookProfile.total_reviews} reviews)
                </div>
              )}
              <div className="flex gap-3 text-sm text-muted-foreground">
                {cookProfile.base_rate_per_dish && <span>Base rate: <strong className="text-foreground">${cookProfile.base_rate_per_dish}/dish</strong></span>}
                {cookProfile.transport_fee && <span>Transport fee: <strong className="text-foreground">${cookProfile.transport_fee}</strong></span>}
              </div>
            </div>
            <Link to="/cook-dashboard">
              <Button variant="outline" className="mt-4">Edit Cook Profile</Button>
            </Link>
          </div>
        )}

        {!cookProfile && (
          <div className="bg-card rounded-2xl border border-border p-6 text-center">
            <ChefHat className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground mb-4">You haven't set up a cook profile yet.</p>
            <Link to="/cook-dashboard">
              <Button className="bg-accent hover:bg-accent/90 text-white">Become a Cook</Button>
            </Link>
          </div>
        )}

        <Button variant="outline" onClick={() => base44.auth.logout()} className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
          Sign Out
        </Button>
      </div>
    </div>
  );
}