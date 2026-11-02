import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CookProfileForm from '@/components/CookProfileForm';
import CookBookingsList from '@/components/CookBookingsList';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import { ChefHat, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function CookDashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.CookProfile.filter({ user_email: u.email });
      setProfile(profiles[0] || null);
      setLoading(false);
    }).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const toggleAvailability = async () => {
    const updated = await base44.entities.CookProfile.update(profile.id, {
      is_available: !profile.is_available,
    });
    setProfile(p => ({ ...p, is_available: !p.is_available }));
    toast({ title: !profile.is_available ? '✅ You are now Available' : '⏸ You are now Unavailable' });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground py-10 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ChefHat className="w-5 h-5 text-accent" />
              <span className="text-white/60 text-sm font-medium">Cook Dashboard</span>
            </div>
            <h1 className="font-playfair text-3xl font-bold text-white">
              {profile ? `Welcome back, ${profile.display_name}` : 'Set Up Your Cook Profile'}
            </h1>
          </div>
          {profile && (
            <button
              onClick={toggleAvailability}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                profile.is_available
                  ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : 'bg-white/10 border-white/20 text-white/50'
              }`}
            >
              {profile.is_available
                ? <><ToggleRight className="w-5 h-5" /> Available</>
                : <><ToggleLeft className="w-5 h-5" /> Unavailable</>
              }
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Tabs defaultValue={profile ? 'bookings' : 'profile'}>
          <TabsList className="mb-8 bg-muted">
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <CookProfileForm user={user} existing={profile} onSaved={setProfile} />
          </TabsContent>

          <TabsContent value="availability">
            {profile ? (
              <AvailabilityCalendar profile={profile} onSaved={setProfile} />
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Complete your profile first to manage availability.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {profile ? (
              <CookBookingsList cookEmail={user.email} />
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Complete your profile first to start receiving bookings.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}