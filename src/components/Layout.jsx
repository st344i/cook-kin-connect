import { Outlet, Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { ChefHat, Home, Search, BookOpen, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/browse', label: 'Find a Cook', icon: Search },
  { to: '/bookings', label: 'My Bookings', icon: BookOpen },
  { to: '/cook-dashboard', label: 'Cook Dashboard', icon: ChefHat },
  { to: '/profile', label: 'My Profile', icon: User }];


  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-foreground/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-playfair text-xl font-bold text-primary-foreground">CookConnect</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) =>
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-[hsl(var(--background))] ${
              isActive(to) ?
              'bg-primary text-primary-foreground' :
              "hover:text-foreground/90 hover:bg-white/10"}`
              }>
              
                {label}
              </Link>
            )}
            {user &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => base44.auth.logout()}
              className="text-foreground/60 hover:text-foreground/90 ml-2">
              
                <LogOut className="w-4 h-4" />
              </Button>
            }
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-foreground/80 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}>
            
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen &&
        <div className="md:hidden bg-foreground border-t border-white/10 px-4 py-3 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon }) =>
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            isActive(to) ?
            'bg-primary text-primary-foreground' :
            'text-foreground/60 hover:bg-white/10'}`
            }>
            
                <Icon className="w-4 h-4" />
                {label}
              </Link>
          )}
          </div>
        }
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="text-center py-6 text-sm font-inter text-[hsl(var(--background))] bg-[hsl(var(--foreground))]">
        <p>© 2026 CookConnect · Empowering cooks, nourishing communities</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <Link to="/about" className="hover:text-foreground/80 transition-colors">About</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-foreground/80 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>);

}