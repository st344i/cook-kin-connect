export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground py-14 px-6 text-center">
        <h1 className="font-playfair text-4xl font-bold text-white mb-3">About CookConnect</h1>
        <p className="text-white/50 max-w-xl mx-auto">Connecting communities through the love of home-cooked food.</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-14 space-y-10 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Our Mission</h2>
          <p>CookConnect is a community marketplace that brings talented home cooks and food lovers together. We believe the best meals are made with love — and that everyone deserves access to authentic, home-cooked food made by people who truly care about their craft.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">How It Works</h2>
          <p>Customers browse local cooks, review their specialties and availability, and submit a booking request. Cooks review the request and send a custom quote. Once agreed, the cook comes to you — or prepares food for you to collect — and a delicious meal is enjoyed.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">For Cooks</h2>
          <p>Whether you're a seasoned professional or a passionate home cook, CookConnect gives you the tools to share your talent, set your own rates, and build a loyal customer base in your community.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Get in Touch</h2>
          <p>Have a question or want to partner with us? Reach out at <a href="mailto:hello@cookconnect.com" className="text-accent underline">hello@cookconnect.com</a>.</p>
        </section>
      </div>
    </div>
  );
}