import { Link } from 'react-router-dom';
import { ChefHat, MapPin, Star, Utensils, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const DIETARY_HIGHLIGHTS = [
  { label: 'Vegan', emoji: '🌱', desc: 'Plant-based meals with no animal products.' },
  { label: 'Halal', emoji: '☪️', desc: 'Certified halal ingredients and preparation.' },
  { label: 'Gluten-Free', emoji: '🌾', desc: 'Safe and delicious for gluten intolerances.' },
  { label: 'Keto', emoji: '🥩', desc: 'Low-carb, high-fat meal plans.' },
  { label: 'Vegetarian', emoji: '🥦', desc: 'No meat, full of flavour.' },
  { label: 'Dairy-Free', emoji: '🥛', desc: 'No dairy ingredients used.' },
];

const features = [
  {
    icon: MapPin,
    title: 'Find Cooks Near You',
    desc: 'Browse skilled home cooks in your neighbourhood, see their availability and specialties.',
  },
  {
    icon: Utensils,
    title: 'Request Any Meal',
    desc: 'Submit your dish list, number of servings, and date. The cook will send a personalised quote.',
  },
  {
    icon: ShieldCheck,
    title: 'Ingredient Transparency',
    desc: 'Before the cook arrives you receive a full ingredient shopping list so nothing is a surprise.',
  },
  {
    icon: Star,
    title: 'Earn Doing What You Love',
    desc: 'Passionate about cooking? Sign up as a cook, set your availability and start earning today.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative min-h-[88vh] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(270,20%,10%) 0%, hsl(152,45%,14%) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 rounded-full px-4 py-1.5 mb-6">
              <ChefHat className="w-4 h-4 text-accent" />
              <span className="text-accent text-sm font-medium">Community-powered cooking</span>
            </div>
            <h1 className="font-playfair text-5xl sm:text-7xl font-bold text-white leading-tight mb-6">
              Real Food.<br />
              <span className="text-accent">Real Cooks.</span><br />
              Your Neighbourhood.
            </h1>
            <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-inter leading-relaxed">
              Connect with passionate home cooks nearby. Get freshly made meals cooked in your kitchen — or start earning from your culinary talent today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-6 text-base rounded-xl shadow-lg shadow-accent/30">
                  Find a Cook Near Me <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link to="/cook-dashboard">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base rounded-xl">
                  Become a Cook
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Simple, transparent and community-first.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-playfair text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dietary Filters Section */}
      <section className="py-20 px-6 bg-muted/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold text-foreground mb-3">Find a Cook for Your Needs</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Every dietary requirement is welcome. Filter cooks by what matters to you.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {DIETARY_HIGHLIGHTS.map(({ label, emoji, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={`/browse?filter=${encodeURIComponent(label)}`}
                  className="group flex flex-col items-center text-center bg-card border border-border rounded-2xl p-5 hover:border-primary hover:shadow-md transition-all h-full"
                >
                  <span className="text-4xl mb-3">{emoji}</span>
                  <span className="font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">{label}</span>
                  <span className="text-muted-foreground text-xs leading-relaxed">{desc}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: 'hsl(152,45%,22%)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-playfair text-4xl font-bold text-white mb-4">Ready to Cook or Get Cooked For?</h2>
          <p className="text-white/60 text-lg mb-8">Join the growing community of home cooks and food lovers across your city.</p>
          <Link to="/browse">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 py-6 text-base rounded-xl">
              Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}