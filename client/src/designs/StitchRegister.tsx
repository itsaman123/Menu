export default function StitchRegister(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Stepper Header */}
      <header className="fixed top-0 w-full z-50 shadow-[0px_20px_40px_rgba(18,28,42,0.06)] h-24 flex items-center" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-5xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-on-surface">The Curated Canvas</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Step 3 of 5: Menu Setup</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              <div className="h-1.5 w-8 rounded-full bg-primary"></div>
              <div className="h-1.5 w-8 rounded-full bg-primary"></div>
              <div className="h-1.5 w-12 rounded-full bg-primary"></div>
              <div className="h-1.5 w-8 rounded-full bg-surface-container-high"></div>
              <div className="h-1.5 w-8 rounded-full bg-surface-container-high"></div>
            </div>
          </div>
        </div>
      </header>
      <main className="pt-32 pb-20 max-w-5xl mx-auto px-6">
        {/* Section: Content Canvas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
          {/* Hero Description (Asymmetric Layout) */}
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center pr-8 mb-8 md:mb-0">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">First Impressions</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface leading-[1.1] mb-6">
              Craft your <br /><span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-container">editorial</span> menu.
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed font-medium">
              Upload your first dish. This is how your customers will see your digital experience. Physical layers, digital magic.
            </p>
            <div className="mt-12 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">Account created successfully</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <p className="text-sm font-semibold text-on-surface">Branding &amp; Theme applied</p>
              </div>
            </div>
          </div>
          {/* Onboarding Card: Step 3 (Main Interaction) */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-surface-container-lowest p-10 rounded-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
              <form className="space-y-8">
                {/* Category Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Category name</label>
                  <input className="w-full h-14 px-6 rounded-DEFAULT bg-surface-container-low border-none focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all text-on-surface font-medium" placeholder="e.g. Signature Mains" type="text" />
                </div>
                {/* Item Bento Detail */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 sm:col-span-1 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Item name</label>
                    <input className="w-full h-14 px-6 rounded-DEFAULT bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface font-medium" placeholder="Truffle Pasta" type="text" />
                  </div>
                  <div className="col-span-2 sm:col-span-1 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Price (₹)</label>
                    <input className="w-full h-14 px-6 rounded-DEFAULT bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all text-on-surface font-medium" placeholder="450" type="number" />
                  </div>
                </div>
                {/* Image Upload Area (Layered Style) */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Item image</label>
                  <div className="group relative h-48 rounded-DEFAULT bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-all">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2">add_a_photo</span>
                    <span className="text-sm font-semibold text-on-surface-variant">Tap to upload dish photo</span>
                    <span className="text-[10px] text-outline mt-1 uppercase tracking-wider">High resolution JPG or PNG</span>
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                  <button className="w-full sm:w-auto px-8 py-4 bg-primary-container text-on-primary-container rounded-DEFAULT font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all" type="button">
                    Save &amp; Continue
                  </button>
                  <button className="w-full sm:w-auto px-8 py-4 bg-surface-container-high text-on-surface rounded-DEFAULT font-bold hover:bg-surface-container-highest transition-all" type="button">
                    Add Another Item
                  </button>
                </div>
              </form>
            </div>
            {/* Preview Layer (The "Physical Layer" look) */}
            <div className="mt-8 relative h-64 rounded-xl overflow-hidden shadow-xl group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
              <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdheAMak6FnpWSoU6XNmThbrlNxbGQUyEzgc1JCr3m0iYof25FhXIKlQlbje9fMyud0t5SnGBwZM5KOXs325xMCM7q7mC9h88UGNXQ8MnS5mRgJorZvQlGJdIwysQpXSXPlDA2ExUlzL5GRIt3eiYtYCWahts0l18GZIBGfYx7xdaL7Z63vipd-Qi3iLCXwgKZa3SITXWKtMPsN-kBRRexI3gAy9U9BZ7Vp3dXRbbR5uleiC5w2X4Uqh-liaZ68TW0UQinI7t15x8" alt="Truffle Pasta preview" />
              <div className="absolute bottom-6 left-8 z-20">
                <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">Live Preview</span>
                <h3 className="text-2xl font-bold text-white tracking-tight">Truffle Pasta</h3>
                <p className="text-white/80 text-sm font-medium">₹ 450.00</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Contextual Footer */}
      <footer className="w-full py-12 bg-surface">
        <div className="max-w-5xl mx-auto px-6 border-t border-outline-variant/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-on-surface-variant font-medium">
            © 2024 The Curated Canvas. Physical layers for digital experiences.
          </div>
          <div className="flex gap-8">
            <a className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="#">Save for Later</a>
            <a className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors" href="#">Need Help?</a>
          </div>
        </div>
      </footer>
      {/* Fixed Mobile Order Bar (Floating Experience) */}
      <div className="md:hidden fixed bottom-8 left-6 right-6 z-50">
        <button className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-[0px_20px_40px_rgba(83,65,205,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all">
          <span>Next: QR Generation</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
