export default function StitchCartOtp(): JSX.Element {
  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">arrow_back</span>
            <h1 className="text-xl font-bold tracking-tighter text-on-surface">Your Order</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest uppercase text-on-surface-variant">Table 12</span>
          </div>
        </div>
      </header>
      {/* Main Canvas */}
      <main className="pt-24 pb-40 px-6 max-w-lg mx-auto">
        {/* Cart Items Section */}
        <section className="space-y-6 mb-12">
          <div className="flex flex-col gap-4">
            {/* Cart Item 1 */}
            <div className="bg-surface-container-lowest p-5 rounded-lg flex items-center gap-4 transition-all duration-300 active:scale-95 group">
              <div className="w-20 h-20 rounded-DEFAULT overflow-hidden bg-surface-container">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJ-M3ygxvRr7iCnWMLAZPidf-h28MWszYcTmzOgEmE_0MaPpWCgaJFsGd3gihwV0T-5isdmjaY-WV1wdMa9mfAb4LdAiyUDN0NRkWIXNYyG5vwkB-L_dYgbPYyKIv-ksBhLGRNY4ZYYmr62xEN2t70m9bmsp8xSWELif0TiessQk9Tz6E7bSKhdXK1K5V7IE6gY_K2WbpvSguDw3WXrAG8itoNG8cPTCdzcWauEAgnYLNFY6LzrVm6ZyqilCF33qYYrwvh5oDOY98" alt="Truffle Risotto" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-on-surface">Truffle Risotto</h3>
                  <span className="text-sm font-bold text-primary">₹650</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">Wild mushrooms, truffle oil, micro-herbs.</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1">
                    <button className="p-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="px-4 text-sm font-bold">1</span>
                    <button className="p-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Cart Item 2 */}
            <div className="bg-surface-container-lowest p-5 rounded-lg flex items-center gap-4 transition-all duration-300 active:scale-95">
              <div className="w-20 h-20 rounded-DEFAULT overflow-hidden bg-surface-container">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuRi1eQr8e1PCWcpIj3J2_JFSUw-UavPnXIQVxOw0svdkFNfStIUN6AggAbRFTOLKQoBCPL--tUg291Ce7arhu0RMnphYzAUtOeTBmx01CMiiNGJma2zXr-Eqc-EDEZXKZ_jlqG3lU5w8jHu8cYHZbOe-lQsKt3iyCgMPPE2sWZ4nEk-jKpYmctaDcenOCxhuqr_88M5X-W-hQGNmRNPX_YCddKJUk4T9ZyrjmV4fy6BSiTYbYJ2ootOFzKNxIj1vnBfETvgHXeIU" alt="Tomato Bruschetta" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-on-surface">Tomato Bruschetta</h3>
                  <span className="text-sm font-bold text-primary">₹320</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">Heirloom tomatoes, balsamic glaze.</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center bg-surface-container-low rounded-full px-2 py-1">
                    <button className="p-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">remove</span>
                    </button>
                    <span className="px-4 text-sm font-bold">2</span>
                    <button className="p-1 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Bill Breakdown */}
        <section className="bg-surface-container-low p-6 rounded-lg space-y-4">
          <h2 className="text-xs font-bold tracking-widest uppercase text-on-surface-variant mb-2">Bill Details</h2>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-on-surface font-semibold">₹1290.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-on-surface-variant">GST (18%)</span>
              <span className="material-symbols-outlined text-xs text-outline">info</span>
            </div>
            <span className="text-on-surface font-semibold">₹232.20</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Service Charge (5%)</span>
            <span className="text-on-surface font-semibold">₹64.50</span>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex justify-between items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Total Payable</span>
              <p className="text-2xl font-black text-on-surface">₹1586.70</p>
            </div>
            <div className="bg-secondary-container px-3 py-1 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <span className="text-[10px] font-bold text-on-secondary-container uppercase">Zero Waste</span>
            </div>
          </div>
        </section>
        {/* Placeholder for OTP State */}
        <div className="mt-10 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-on-surface">Secure Checkout</h3>
            <p className="text-sm text-on-surface-variant mt-1">Enter your mobile number to confirm the order</p>
          </div>
          <div className="space-y-4">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">+91</span>
              <input className="w-full h-14 pl-14 pr-4 bg-surface-container-low border-none rounded-DEFAULT focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300 font-semibold tracking-wide" placeholder="Mobile Number" type="tel" />
            </div>
            <button className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-DEFAULT shadow-lg active:scale-95 transition-all">
              Get Verification Code
            </button>
          </div>
        </div>
      </main>
      {/* OTP Verification Overlay */}
      <div className="fixed inset-0 z-[60] bg-surface/95 backdrop-blur-xl flex items-end md:items-center justify-center">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-t-xl md:rounded-xl p-8 shadow-2xl relative">
          <button className="absolute top-6 right-6 text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
            </div>
            <h2 className="text-2xl font-black text-on-surface tracking-tight">Verify Order</h2>
            <p className="text-on-surface-variant text-sm mt-2 px-8">We've sent a 4-digit code to <span className="font-bold text-on-surface">+91 98765 43210</span></p>
          </div>
          <div className="flex justify-between gap-3 mb-8 max-w-xs mx-auto">
            <input className="w-14 h-14 bg-surface-container-low border-none rounded-DEFAULT text-center text-xl font-bold text-on-surface focus:ring-2 focus:ring-primary/20" maxLength={1} type="text" />
            <input className="w-14 h-14 bg-surface-container-low border-none rounded-DEFAULT text-center text-xl font-bold text-on-surface focus:ring-2 focus:ring-primary/20" maxLength={1} type="text" />
            <input className="w-14 h-14 bg-surface-container-low border-none rounded-DEFAULT text-center text-xl font-bold text-on-surface focus:ring-2 focus:ring-primary/20" maxLength={1} type="text" />
            <input className="w-14 h-14 bg-surface-container-low border-none rounded-DEFAULT text-center text-xl font-bold text-on-surface focus:ring-2 focus:ring-primary/20" maxLength={1} type="text" />
          </div>
          <div className="space-y-4">
            <button className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-DEFAULT shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
              Place Order • ₹1586.70
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
            <div className="text-center">
              <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Resend Code in 0:45</button>
            </div>
          </div>
          <p className="mt-8 text-[10px] text-center text-on-surface-variant px-12 leading-relaxed uppercase tracking-tighter">
            By verifying, you agree to our Terms of Service &amp; Privacy Policy for a digital dining experience.
          </p>
        </div>
      </div>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-6 pb-6 pt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0px_-10px_30px_rgba(18,28,42,0.08)] rounded-t-[32px]">
        <div className="flex flex-col items-center gap-1 text-on-surface-variant p-2 opacity-80 active:scale-95 transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-on-surface-variant p-2 opacity-80 active:scale-95 transition-all">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
        </div>
        <div className="bg-gradient-to-br from-primary to-primary-container text-white rounded-full p-3 mb-2 scale-110 shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-on-surface-variant p-2 opacity-80 active:scale-95 transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </div>
      </nav>
    </div>
  );
}
