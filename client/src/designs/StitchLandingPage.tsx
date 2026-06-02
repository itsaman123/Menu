export default function StitchLandingPage(): JSX.Element {
  return (
    <div className="bg-surface font-body text-on-surface">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 shadow-[0px_20px_40px_rgba(18,28,42,0.06)]" style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-12">
            <span className="text-2xl font-black tracking-tighter text-[#121C2A] dark:text-white">The Curated Canvas</span>
            <div className="hidden md:flex gap-8 items-center">
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#features">Features</a>
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#pricing">Pricing</a>
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#">Admin</a>
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#">Help</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden sm:block text-[#474554] font-semibold tracking-tight px-4 py-2">Login</button>
            <button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-semibold tracking-tight transition-all duration-300 scale-100 active:scale-95 shadow-sm">Get Started</button>
          </div>
        </div>
      </nav>
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-surface-container-high text-primary font-label text-xs font-bold tracking-widest">FOR MODERN RESTAURATEURS</span>
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-on-surface leading-[1.1]">
                Create QR Menus &amp; Accept Orders — <span className="text-primary italic">No App Needed</span>.
              </h1>
              <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed">
                Transform your dining experience with digital layers. From contactless browsing to instant settlements, all through a beautiful QR scan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform duration-300">Start Free Trial</button>
                <button className="bg-surface-container-lowest text-on-surface border-2 border-outline-variant/15 px-10 py-5 rounded-full font-bold text-lg flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Demo
                </button>
              </div>
              <div className="flex items-center gap-4 pt-6 text-on-surface-variant font-medium">
                <div className="flex -space-x-3">
                  <img alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB10D0P8QIqZRQotvMEkSAFWyLz93t8b-unRu2akXGYz1rTIekmzJLhaUvPL-BjZR8q8z3yOrLRVKc6zEjCrDFx4_6yEAvZOv8zK9U9BBGq8yRvKcYRMjg-Uz--paFD99H4K-4yhQMeojcBYaliSzeBYQoq7_C9EHxSnmjt1av43EEP_bPcGfyONfW3ZUcOFlHivMgupApXcLhTpMjM_d57qtVfpJcfcf10AHDGcyFbqPEW772A1l74NO2Pft-PfJdc17LCxkOIZKg" />
                  <img alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKc0nizbg3yNfhm9J7KaE1z3aaJnPdPVB4KTgYHNaj40p4Qr4E568NxaMQyY1Xs8osOInx1WRhV21DOeF--MFk7MS5H2E07Qa2aP9U05RdDvyb0hMLl_LzMiFkr_qcRKfr6ANcLAdgYAjv8c3uOA8zjssm-bSe6LpN8IzFeL7dGFx5s052qB7vWigGMTlBRwwDGUprE5RLY9rIc3V4mUp9UGnUDlZExUZ_BK9Z_lH27esUE4CPggNuvfLodArrn6izg1p9uHiz13A" />
                  <img alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCzIdsdQAPJ3q7MkRxZeGpsdc_REahHYb2MYE_QVY9e4OnJIDAEEEi7o8PJJ8pjGPFXMaqwPzBEON6ip5BMiuiC-gP637A9tiSFtarDOr3t2HBw5FqnaAKx8zcI-9FgZBhqTvZJxZvHd7MxA0FLwu0gGN0Yk_QMfafz3pPOywo4gMr-IQAt4Re6ILFE6JXXqbQrMiaDNZamsLh3ope7rWK8rF3LMVml1s6-NhDbY9oFERgdxi1SEmO3dFVYMyz7yKGaWKqoX8G9fg" />
                </div>
                <span>Trusted by 500+ Indian Outlets</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
              <div className="relative bg-surface-container-low rounded-[3rem] p-4 rotate-3 scale-105" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                <img alt="Dashboard" className="rounded-[2rem] w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUdCF2iwobeYHFcwjhD9VvTMWevamBK0X7ncEo-gTwdmecbVsXTTRd7trpEnu1QE3FH3IJ7UBYu93QLeQCAxr4AjNoV1W4-mCxxsqTVE73QGVNn2IBRtWzoh-fMvOJPPvGu0f_UgriixkcwP6zJnZReMyFUVzL8irOqxPmmook-eEyYcsDWpUgnaFlSCf6kvhEzkgd-xLrRdAwSptnWcMyWOr7L9pfLBuahz5Loivk6fm1yP2io0QgNUAD-flVqO0Z3oNN82Lfs6k" />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-3xl shadow-2xl space-y-3 -rotate-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                      <span className="material-symbols-outlined">payments</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">New Order</p>
                      <p className="text-lg font-black text-on-surface">₹2,450.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section: Bento Grid */}
        <section className="py-32 bg-surface-container-low" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-on-surface">Precision Tools for Fine Dining.</h2>
              <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">We provide a seamless digital layer for your physical space, focusing on speed and aesthetics.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* QR Menu (Large) */}
              <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-10 group overflow-hidden relative" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="space-y-4 max-w-sm">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">qr_code_2</span>
                    </div>
                    <h3 className="text-3xl font-black text-on-surface">Dynamic QR Menu</h3>
                    <p className="text-on-surface-variant leading-relaxed">Update prices, hide out-of-stock items, and change layouts in real-time. No re-printing required.</p>
                  </div>
                  <div className="mt-8 flex gap-4">
                    <span className="px-4 py-2 bg-surface rounded-full text-xs font-bold tracking-widest text-on-surface uppercase">Instant Sync</span>
                    <span className="px-4 py-2 bg-surface rounded-full text-xs font-bold tracking-widest text-on-surface uppercase">Image Rich</span>
                  </div>
                </div>
                <img alt="" className="absolute -right-20 -bottom-20 w-2/3 rotate-[-15deg] group-hover:rotate-0 transition-all duration-700 rounded-3xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiOZJ47YbgH4nGQdsvSxF72JXb8sEvZ7_TNE295QQMy2ak6EmPhBjfTlH-KTbaR2fuQ9gfj9fMaqU1SlESF6uy_XXblT8M4YyjMQzXK9Sww0OcAFSt7v01zebAhDLfBeo6Ol4-MoNzFdLzGOzPp3W3jWWy5i3JIOJx7tvXFUUytFYo1DnUVlz3oN8INL2krw9kOKeCXsoqVuN78MxNPpFQZ0NZGvAKRIX1BmLvjVcjUoeIMo8eJlKVeeJOm_PXwLtRW8EI0XMqTxk" />
              </div>
              {/* Order Mgmt (Small) */}
              <div className="md:col-span-4 bg-primary text-on-primary rounded-xl p-10" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined">restaurant</span>
                    </div>
                    <h3 className="text-3xl font-black">Live Order Management</h3>
                    <p className="text-on-primary/80 leading-relaxed">KOT management, table-wise tracking, and status updates for your kitchen crew.</p>
                  </div>
                  <button className="mt-8 text-white flex items-center gap-2 font-bold tracking-tight">
                    Learn More <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
              {/* Analytics (Small) */}
              <div className="md:col-span-5 bg-surface-container-highest rounded-xl p-10" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-on-primary-container">
                    <span className="material-symbols-outlined">insights</span>
                  </div>
                  <h3 className="text-2xl font-black text-on-surface">Deep Analytics</h3>
                  <p className="text-on-surface-variant leading-relaxed">Understand your bestsellers, peak hours, and customer spending habits with visual heatmaps.</p>
                </div>
              </div>
              {/* OTP Login (Medium) */}
              <div className="md:col-span-7 bg-white rounded-xl p-10 border border-outline-variant/10" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary-container">
                      <span className="material-symbols-outlined">lock_person</span>
                    </div>
                    <h3 className="text-2xl font-black text-on-surface">Secure OTP Login</h3>
                    <p className="text-on-surface-variant leading-relaxed">Zero friction for guests. No passwords. Authenticate instantly via phone number for orders and loyalty.</p>
                  </div>
                  <div className="bg-surface-container p-6 rounded-2xl space-y-4">
                    <div className="h-2 w-1/2 bg-outline-variant/30 rounded-full"></div>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 bg-white border border-outline-variant/20 rounded flex items-center justify-center font-bold">5</div>
                      <div className="h-10 w-10 bg-white border border-outline-variant/20 rounded flex items-center justify-center font-bold">8</div>
                      <div className="h-10 w-10 bg-white border border-outline-variant/20 rounded flex items-center justify-center font-bold">3</div>
                      <div className="h-10 w-10 bg-white border border-outline-variant/20 rounded flex items-center justify-center font-bold">9</div>
                    </div>
                    <div className="h-8 w-full bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section className="py-32 bg-surface" id="pricing">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-on-surface">Simple Pricing. Infinite Growth.</h2>
              <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">Choose the canvas that fits your scale.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter */}
              <div className="bg-surface-container-low p-10 rounded-xl space-y-8 border-2 border-transparent hover:border-outline-variant/30 transition-all duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹0</span>
                    <span className="text-on-surface-variant">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Digital QR Menu
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Up to 25 items
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Basic Analytics
                  </li>
                </ul>
                <button className="w-full py-4 rounded-full border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">Select Plan</button>
              </div>
              {/* Growth */}
              <div className="bg-white p-10 rounded-xl space-y-8 border-2 border-primary-container relative scale-105 z-10" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Popular</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Growth</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹999</span>
                    <span className="text-on-surface-variant">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Everything in Starter
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Unlimited Items
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Direct WhatsApp Ordering
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Advanced Dashboard
                  </li>
                </ul>
                <button className="w-full py-4 rounded-full bg-primary-container text-on-primary-container font-bold shadow-lg hover:brightness-110 transition-all">Select Plan</button>
              </div>
              {/* Pro */}
              <div className="bg-surface-container-low p-10 rounded-xl space-y-8 border-2 border-transparent hover:border-outline-variant/30 transition-all duration-300">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">₹2499</span>
                    <span className="text-on-surface-variant">/mo</span>
                  </div>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Everything in Growth
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Multi-outlet Support
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    POS Integration
                  </li>
                  <li className="flex items-center gap-3 text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    Dedicated Manager
                  </li>
                </ul>
                <button className="w-full py-4 rounded-full border-2 border-on-surface text-on-surface font-bold hover:bg-on-surface/5 transition-colors">Select Plan</button>
              </div>
            </div>
          </div>
        </section>
        {/* Testimonials Section */}
        <section className="py-32 bg-surface-container-low overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-8">
                <h2 className="text-5xl font-black tracking-tight leading-tight">Voices from the <span className="text-primary italic">Cloud Kitchens &amp; Bistros</span> of India.</h2>
                <div className="bg-white p-8 rounded-3xl space-y-6 relative" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
                  <span className="material-symbols-outlined text-5xl text-primary-container/20 absolute top-4 right-8">format_quote</span>
                  <p className="text-xl italic text-on-surface-variant leading-relaxed">"The Curated Canvas changed how our staff handles the dinner rush. No more manual entry errors, and the digital menu looks as premium as our food."</p>
                  <div className="flex items-center gap-4">
                    <img alt="Arjun Mehta" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnM4qWsKJ7cw0N34NlhsbjCGjGxQVj1jMFNw7npnck83F0oBKe5ZNMFzDG4HTHABMTLyFlsKHAJh_I-09Gy6WUSqNoPXz4aBb10kt1g6TGmFZis5iC4qTmrUMBET8vCfgLu9iUV-qPs4iGT7Wisty1YS1QbbaxCnXAHj0baTk2e-6xHYC96fP7_-wO8UpZufT4S0iLnNc5R4r0NyNRm0DYLDEPv6lLEciZWniOnzny4t3p3nJ1VF8SP3FhVixE2PR-8yrrMxy_z0Q" />
                    <div>
                      <p className="font-bold">Arjun Mehta</p>
                      <p className="text-sm text-on-surface-variant">Founder, Saffron &amp; Sage (Mumbai)</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                    <p className="text-sm text-on-surface-variant mb-4">"Best ROI we've seen on a tech product."</p>
                    <p className="font-bold text-xs uppercase tracking-widest">— Cafe Bengaluru</p>
                  </div>
                  <div className="bg-primary-container text-on-primary-container p-6 rounded-2xl shadow-lg">
                    <p className="text-sm mb-4">"The QR scanning is lightning fast even on low-speed data."</p>
                    <p className="font-bold text-xs uppercase tracking-widest">— Spice Route Delhi</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-surface-container-highest p-6 rounded-2xl shadow-sm">
                    <p className="text-sm text-on-surface-variant mb-4">"Customer love the contactless payments integration."</p>
                    <p className="font-bold text-xs uppercase tracking-widest">— Coastal Bites Goa</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                    <p className="text-sm text-on-surface-variant mb-4">"Analytics helped us trim our menu by 20%."</p>
                    <p className="font-bold text-xs uppercase tracking-widest">— Urban Tadhka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Footer */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-6 text-center bg-primary rounded-[3rem] p-20 text-on-primary relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-5xl font-black tracking-tight">Ready to curate your experience?</h2>
              <p className="text-xl text-on-primary/80 max-w-xl mx-auto">Join hundreds of restaurants growing with The Curated Canvas. Start your 14-day free trial today.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="bg-white text-primary px-12 py-5 rounded-full font-black text-xl shadow-xl hover:scale-105 transition-transform duration-300">Start Free Trial</button>
                <button className="text-white font-bold underline underline-offset-8 px-12 py-5">Speak with Sales</button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="w-full py-12 bg-[#EFF4FF] dark:bg-slate-900 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-8">
          <span className="text-lg font-black text-[#121C2A]">The Curated Canvas</span>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Contact Us</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Documentation</a>
          </div>
          <p className="text-sm text-[#474554]">© 2024 The Curated Canvas. Physical layers for digital experiences.</p>
        </div>
      </footer>
      {/* BottomNavBar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-6 pb-6 pt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-t-[32px] shadow-[0px_-10px_30px_rgba(18,28,42,0.08)]">
        <button className="bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-4 mb-2 scale-110 shadow-lg flex flex-col items-center">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
        </button>
        <button className="text-[#474554] p-2 flex flex-col items-center">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Menu</span>
        </button>
        <button className="text-[#474554] p-2 flex flex-col items-center">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Orders</span>
        </button>
        <button className="text-[#474554] p-2 flex flex-col items-center">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}
