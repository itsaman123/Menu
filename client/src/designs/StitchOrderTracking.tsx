export default function StitchOrderTracking(): JSX.Element {
  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-surface-container-low rounded-full transition-all">
              <span className="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <span className="text-xl font-black tracking-tighter text-on-surface">The Curated Canvas</span>
          </div>
          <button className="p-2 hover:bg-surface-container-low rounded-full transition-all">
            <span className="material-symbols-outlined text-on-surface">help</span>
          </button>
        </div>
      </header>
      <main className="pt-24 pb-32 px-6 max-w-lg mx-auto min-h-screen">
        {/* Success Message Section */}
        <section className="text-center mb-10 mt-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary-container mb-6 shadow-sm">
            <span className="material-symbols-outlined text-on-secondary-container text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Order Placed Successfully 🎉</h1>
          <p className="text-on-surface-variant font-medium">Order ID: <span className="text-on-surface font-bold">#CC-82910</span></p>
        </section>
        {/* Live Tracking Bento Card */}
        <section className="space-y-6">
          {/* Countdown & Status Card */}
          <div className="bg-surface-container-lowest rounded-lg p-8 shadow-[0px_20px_40px_rgba(18,28,42,0.06)] relative overflow-hidden">
            {/* Decoration element */}
            <div className="absolute -top-12 -right-12 w-32 h-32 opacity-10 rounded-full" style={{ background: 'linear-gradient(135deg, #5341cd 0%, #6c5ce7 100%)' }}></div>
            <div className="flex flex-col items-center text-center">
              <span className="text-label-md font-bold tracking-widest uppercase text-primary mb-2">Estimated Prep Time</span>
              <div className="text-5xl font-black tracking-tighter text-on-surface mb-4">12:00 <span className="text-lg font-bold">mins</span></div>
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full w-1/3 rounded-full" style={{ background: 'linear-gradient(135deg, #5341cd 0%, #6c5ce7 100%)' }}></div>
              </div>
              <p className="mt-6 text-on-surface-variant text-sm font-medium leading-relaxed">
                Chef <span className="text-on-surface font-bold">Anand</span> has received your order and is selecting the freshest ingredients.
              </p>
            </div>
          </div>
          {/* Live Stepper Section */}
          <div className="bg-surface-container-low rounded-lg p-6">
            <h3 className="text-label-md font-bold tracking-widest uppercase text-on-surface-variant mb-8">Live Status</h3>
            <div className="relative space-y-12">
              {/* Step 1: Completed */}
              <div className="flex items-start gap-6 relative">
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-primary h-12"></div>
                <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, #5341cd 0%, #6c5ce7 100%)' }}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Order Placed</h4>
                  <p className="text-sm text-on-surface-variant">We've confirmed your order.</p>
                  <span className="text-[10px] font-bold text-primary-container uppercase mt-1 block">12:42 PM</span>
                </div>
              </div>
              {/* Step 2: Active */}
              <div className="flex items-start gap-6 relative">
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-outline-variant h-12"></div>
                <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full border-4 border-primary-fixed bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Preparing</h4>
                  <p className="text-sm text-on-surface-variant">Your meal is being crafted with love.</p>
                  <span className="text-[10px] font-bold text-primary uppercase mt-1 block">In Progress</span>
                </div>
              </div>
              {/* Step 3: Upcoming */}
              <div className="flex items-start gap-6">
                <div className="z-10 flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                  <span className="material-symbols-outlined text-sm">notifications_active</span>
                </div>
                <div>
                  <h4 className="font-bold text-outline">Ready</h4>
                  <p className="text-sm text-on-surface-variant opacity-50">Pick up from the counter.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Order Summary Card */}
          <div className="bg-surface-container-lowest rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Order Summary</h3>
              <span className="text-sm font-bold text-primary">Edit Items</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded bg-surface-container-low overflow-hidden flex-shrink-0">
                    <img alt="Artisan Salad" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQJpFNIsAH_-Ir8t1JS1Wc-Thvnbn2zJQH_pAEYhHbreWFnbql3X96sfyE6MESgUyndjK-3xdpGTSsxSRhi6SyLuzr0HxZHzJyVgCclNAg5ZOLG-z2X5Dqa_xGHbMaLfnU3oWAkhz55XQVvCoFQ9jnu7uWYL2O-U--boAUx118kiAJlpZDft2_IJ-7V1N48zi-S_q80DYaiIvJCid0xiUYE3AmTa4C4iSPSNnnfxog6awwRNVQT6YfV74D3Pkg-sPP4-wkNs2jiVg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm border border-secondary flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                      </span>
                      <p className="font-bold text-sm">Wild Forest Bowl</p>
                    </div>
                    <p className="text-xs text-on-surface-variant">x 1 • Extra Dressing</p>
                  </div>
                </div>
                <p className="font-bold text-sm">₹450</p>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded bg-surface-container-low overflow-hidden flex-shrink-0">
                    <img alt="Cold Brew" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjX-BR1kwnI0QYH1K7vJ-OD2FAu1Kpbru8BOyqr7san4VrzjBNunhQghIqr_Jtx2UpgWUnex0wCOkuUL4PdDxo3HO7sqtIBRr3koqkzkfybzqVx6fDXQTXFGCwBqyUX7B6LVLGEhcvfbK2L_1V4oTHK3jGt1aG2y7DsLce1ZI9E1oMdPYBUG32Zch0plMDtXueXCR_Gb5EerZ26L7UWi9gkU8_K7WKzXyi5Hbvbbky6oODAozIQkzq50f-GSdz1Ctgy2HwC4npCGk" />
                  </div>
                  <div>
                    <p className="font-bold text-sm ml-[1.125rem]">Nitro Cold Brew</p>
                    <p className="text-xs text-on-surface-variant ml-[1.125rem]">x 2 • Large</p>
                  </div>
                </div>
                <p className="font-bold text-sm">₹380</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-dashed border-outline-variant">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-on-surface-variant">Subtotal</span>
                <span className="text-sm font-medium">₹830</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-on-surface-variant">Taxes &amp; Fees</span>
                <span className="text-sm font-medium">₹42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-black uppercase tracking-tight">Total Paid</span>
                <span className="text-xl font-black text-primary">₹872</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Contextual Action Bar */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-2xl px-6 pb-8 pt-4 rounded-t-[32px] shadow-[0px_-10px_30px_rgba(18,28,42,0.08)]">
        <div className="max-w-md mx-auto flex gap-4">
          <button className="flex-1 py-4 bg-surface-container-high text-on-surface font-bold rounded-full transition-all active:scale-95">
            Need Help?
          </button>
          <button className="flex-1 py-4 text-white font-bold rounded-full shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #5341cd 0%, #6c5ce7 100%)' }}>
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Get Receipt
          </button>
        </div>
      </footer>
    </div>
  );
}
