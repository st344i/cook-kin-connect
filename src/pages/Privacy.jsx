export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-foreground py-14 px-6 text-center">
        <h1 className="font-playfair text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-white/50 max-w-xl mx-auto">Last updated: May 2026</p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-14 space-y-10 text-foreground/80 leading-relaxed">
        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Information We Collect</h2>
          <p>We collect information you provide when registering, creating a cook profile, or making a booking — including your name, email address, location, and booking details. We use this information solely to operate and improve the CookConnect platform.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">How We Use Your Data</h2>
          <p>Your data is used to facilitate bookings between cooks and customers, personalise your experience, and send relevant notifications. We do not sell or share your personal information with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Data Security</h2>
          <p>We take reasonable technical and organisational measures to protect your personal data from unauthorised access, loss, or misuse. All data is stored securely and access is restricted to authorised personnel only.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Your Rights</h2>
          <p>You have the right to access, correct, or delete the personal data we hold about you. To exercise any of these rights, please contact us at <a href="mailto:privacy@cookconnect.com" className="text-accent underline">privacy@cookconnect.com</a>.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Cookies</h2>
          <p>We use essential cookies to keep you logged in and maintain your session. We do not use tracking or advertising cookies.</p>
        </section>

        <section>
          <h2 className="font-playfair text-2xl font-bold text-foreground mb-3">Changes to This Policy</h2>
          <p>We may update this policy from time to time. Any significant changes will be communicated via email or a notice on the platform.</p>
        </section>
      </div>
    </div>
  );
}