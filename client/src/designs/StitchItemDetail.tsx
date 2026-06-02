export default function StitchItemDetail(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface font-body">
      {/* Parent UI (Menu Background) */}
      <main className="min-h-screen relative overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary cursor-pointer">arrow_back</span>
            <span className="font-inter tracking-tight font-bold text-on-surface text-xl font-black bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] bg-clip-text text-transparent">The Curated Canvas</span>
          </div>
          <div className="flex gap-4">
            <span className="material-symbols-outlined text-slate-500">notifications</span>
            <span className="material-symbols-outlined text-slate-500">settings</span>
          </div>
        </header>
        {/* Mock Background Content */}
        <div className="pt-24 px-6 space-y-8">
          <div className="h-12 w-3/4 bg-surface-container-low rounded-full"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-surface-container-low rounded-lg"></div>
            <div className="h-48 bg-surface-container-low rounded-lg"></div>
            <div className="h-48 bg-surface-container-low rounded-lg"></div>
            <div className="h-48 bg-surface-container-low rounded-lg"></div>
          </div>
        </div>
        {/* Dimmed Overlay */}
        <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px] z-[60]"></div>
        {/* Bottom Sheet Wrapper */}
        <div className="fixed inset-x-0 bottom-0 z-[70] flex flex-col max-h-[813px] bg-surface-container-lowest rounded-t-xl overflow-hidden shadow-[0px_-20px_60px_rgba(18,28,42,0.12)]">
          {/* Handle */}
          <div className="flex justify-center p-3 absolute top-0 w-full z-10">
            <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full"></div>
          </div>
          {/* Scrollable Content */}
          <div className="overflow-y-auto pb-32" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            {/* Hero Image */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/9]">
              <img alt="Truffle Mushroom Risotto" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRr1cisRbvAuf1XHNL9EP4ZnPof56MKSv42dR6DC_6ox53mtuMSWBpZvFTegC_zMP_IaGU1vPLyYrOPiHDJfAoLmGhEr2LX07J0VlO0IuraSbIMPcBvxXEqPbIB_3vl3wcmn2SfcFX--aPfh1i1BgZHh82b56yWpBi5aHmecVEqWSaadp1_AdZowjN0hLQjc_o_9fKRtEU4vLoqE-tXtVhItwXjMSNCm7P62AyaVLu3dkJFI33No2KJZ30KpC5ShU_lSAHBMheRmU" />
              <div className="absolute top-6 right-6">
                <button className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-on-surface shadow-sm">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="absolute bottom-6 left-6 flex gap-2">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase text-secondary">VEGETARIAN</span>
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase text-tertiary">BESTSELLER</span>
              </div>
            </div>
            {/* Content Body */}
            <div className="p-6 space-y-8">
              {/* Title & Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-on-surface tracking-tight leading-tight">Truffle Mushroom Risotto</h1>
                  <p className="text-on-surface-variant leading-relaxed">Rich and creamy arborio rice with earthy truffles, sautéed wild mushrooms, and finished with aged parmesan.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary tracking-tighter">₹520</span>
                </div>
              </div>
              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg">
                <span className="font-bold text-on-surface uppercase tracking-wider text-xs">Quantity</span>
                <div className="flex items-center gap-6">
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <span className="text-lg font-black w-4 text-center">1</span>
                  <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
              </div>
              {/* Add-ons Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-on-surface uppercase tracking-widest">Add Customizations</h2>
                  <span className="text-[10px] font-medium text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">OPTIONAL</span>
                </div>
                <div className="space-y-3">
                  {/* Add-on Item 1 */}
                  <label className="flex items-center justify-between p-5 bg-white border border-transparent hover:border-primary/20 rounded-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center">
                        <input className="peer h-6 w-6 border-2 border-outline-variant rounded-md text-primary focus:ring-primary/20 transition-all checked:bg-primary checked:border-primary" type="checkbox" />
                        <span className="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 left-0 text-sm w-6 text-center pointer-events-none">check</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">Extra Cheese</p>
                        <p className="text-xs text-on-surface-variant">Shaved Grana Padano</p>
                      </div>
                    </div>
                    <span className="font-bold text-on-surface-variant">+₹50</span>
                  </label>
                  {/* Add-on Item 2 */}
                  <label className="flex items-center justify-between p-5 bg-white border border-transparent hover:border-primary/20 rounded-lg transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center">
                        <input className="peer h-6 w-6 border-2 border-outline-variant rounded-md text-primary focus:ring-primary/20 transition-all checked:bg-primary checked:border-primary" type="checkbox" />
                        <span className="material-symbols-outlined absolute text-white opacity-0 peer-checked:opacity-100 left-0 text-sm w-6 text-center pointer-events-none">check</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">Add Truffle Oil</p>
                        <p className="text-xs text-on-surface-variant">White Truffle Infusion</p>
                      </div>
                    </div>
                    <span className="font-bold text-on-surface-variant">+₹80</span>
                  </label>
                </div>
              </section>
            </div>
          </div>
          {/* Fixed Bottom CTA */}
          <div className="p-6 bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0px_-10px_30px_rgba(18,28,42,0.04)]">
            <button className="w-full h-16 bg-gradient-to-br from-primary to-primary-container text-white rounded-lg font-black flex items-center justify-center gap-3 shadow-lg shadow-primary/25 active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined">shopping_bag</span>
              <span>Add to Cart - ₹520</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
