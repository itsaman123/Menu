export default function StitchCustomerMenu(): JSX.Element {
  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* Header / TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white">
              <span className="material-symbols-outlined">restaurant</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-[#121C2A] dark:text-white">The Curated Canvas</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-all hover:bg-slate-100/50 active:scale-90">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>
      <main className="pt-24 pb-32">
        {/* Hero Section */}
        <section className="px-6 mb-8">
          <div className="relative h-48 rounded-lg overflow-hidden group">
            <img alt="Gourmet Dining" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUBExby2R-g-jn4yDJXrGjhn2PIMKa8UnZcrEpP8_X7ia_dIUZMUY-yeIZIQgDtZuLIwJ0k7S4tTrNIGeqbP3v5bi51NI0DdPdoFCoTRtIRkSMQFeJcHFP_lfR0vNlCUWxa4dUI0l4vSynqF43KIusF33uxhdos4L6mU735c05E08P5i4T49WqWQVu2nrn4-4xKqi0O2Hu0mY2131ewhjQ3-sxkXnSvfVTsNnIkQ95REg31Z97zaTUOFMXeEDSFDQMZlQ-MjOgYec" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <p className="text-white/80 text-sm font-medium uppercase tracking-widest mb-1">Welcome to</p>
              <h1 className="text-white text-2xl font-bold tracking-tight">The Curated Experience</h1>
            </div>
          </div>
        </section>
        {/* Category Tabs (Horizontal Scroll) */}
        <section className="sticky top-20 z-40 bg-surface py-4">
          <div className="flex overflow-x-auto gap-3 px-6" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <button className="whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white shadow-md active:scale-95">All Items</button>
            <button className="whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all bg-surface-container-low text-on-surface-variant hover:bg-white/50 active:scale-95">Signature Starters</button>
            <button className="whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all bg-surface-container-low text-on-surface-variant hover:bg-white/50 active:scale-95">Main Canvas</button>
            <button className="whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all bg-surface-container-low text-on-surface-variant hover:bg-white/50 active:scale-95">Liquid Art</button>
            <button className="whitespace-nowrap px-6 py-3 rounded-full font-semibold text-sm transition-all bg-surface-container-low text-on-surface-variant hover:bg-white/50 active:scale-95">Sweet Finales</button>
          </div>
        </section>
        {/* Menu Grid */}
        <section className="px-6 space-y-8 mt-4">
          {/* Category Heading */}
          <div>
            <h2 className="text-on-surface text-xl font-extrabold tracking-tight mb-2">Signature Starters</h2>
            <div className="h-1 w-12 bg-primary rounded-full"></div>
          </div>
          {/* Menu Item Card 1 */}
          <div className="group flex gap-4 p-4 rounded-lg bg-surface-container-lowest transition-all hover:scale-[1.02] hover:bg-surface-container-highest">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">eco</span>
                <h3 className="text-on-surface font-bold text-lg leading-tight">Burrata &amp; Heirloom Art</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">Creamy burrata heart, balsamic pearls, and garden-fresh heirloom tomatoes with a basil emulsion.</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-on-surface font-black text-lg tracking-tight">₹450</span>
                <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
              <img alt="Burrata Salad" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpQWh7YejAvAsIIMpeZlZNRTjQFdiHTaWPlmrTSvvbeci6wEIou22ubdXmFaqP00mm0PlpfIIeauAqaXJogWrH0OYUEI0aKjVe9gvpsAcTznFKJ9eZt25GqhCRIYPI2_kV-2QMrood4RidpWc-bI_3y_ceHdYR0JvyjiCtaIZncnJBGcf6H12DOqK7X_UKuDhrKndPTvlCl643slMMlHwV_ZEUV4zhSPvQWYKo0YQM3HnPywjvng6HMcYBgX_okDSZs5Id-gOgzX4" />
            </div>
          </div>
          {/* Menu Item Card 2 */}
          <div className="group flex gap-4 p-4 rounded-lg bg-surface-container-lowest transition-all hover:scale-[1.02] hover:bg-surface-container-highest">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">restaurant_menu</span>
                <h3 className="text-on-surface font-bold text-lg leading-tight">Truffle Infused Dumplings</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">Hand-pleated forest mushroom parcels with a touch of black truffle oil and soy ginger dip.</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-on-surface font-black text-lg tracking-tight">₹520</span>
                <div className="flex items-center bg-primary-container/10 rounded-full px-1">
                  <button className="w-8 h-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-sm">remove</span></button>
                  <span className="px-2 font-bold text-sm text-primary">1</span>
                  <button className="w-8 h-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-sm">add</span></button>
                </div>
              </div>
            </div>
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
              <img alt="Gourmet Dumplings" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC4jA0nCg4fYd52c4_pKG4Zbs4aNCi-LiT5XuJBp9XIOwBQwjUrqmM9h-wgle631KPg6uc4S9PTfiNiEHUco7JZi8dm-J0Vp-NT-Lwpd8xJoHLnfwfQ5g3eM53Mf52XTjnulFb6nOdBcKBOibhsClxJM-vKHpHjawh860GDtkXyvG5s2hqiDxpxCICGSbhymoJaLiYak0Z-iG6v5eckCEVjdCvYbxI-Duig-q7tKqPgPoYUSXIUTNJjy-27tyUXM_i7GuReablnLI" />
            </div>
          </div>
          {/* Category Heading 2 */}
          <div className="pt-4">
            <h2 className="text-on-surface text-xl font-extrabold tracking-tight mb-2">Main Canvas</h2>
            <div className="h-1 w-12 bg-primary rounded-full"></div>
          </div>
          {/* Menu Item Card 3 */}
          <div className="group flex gap-4 p-4 rounded-lg bg-surface-container-lowest transition-all hover:scale-[1.02] hover:bg-surface-container-highest">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-sm">eco</span>
                <h3 className="text-on-surface font-bold text-lg leading-tight">Saffron Risotto Primavera</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">Vibrant Arborio rice slow-cooked with Kashmiri saffron and seasonal grilled vegetables.</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-on-surface font-black text-lg tracking-tight">₹780</span>
                <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
              <img alt="Saffron Risotto" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUUAngsEt_oHBAwcJQFzJ1i4G4egdG8vTM-FJ-RVvnkt-qlfPjo1RRSGIYn9K1sAv8NEaJOkAi5J2s38LC8-6zy81J7PYvzScQlwKPNNyP10sl9mOrzKQzQYF77SJCO6BS4Wk9nOS-kgZ9hJo2I4aRqeTltWN9iGpcaFiSFZpNktHSbcBdqzJxMoQmQeY6DVQZFE7mi7awDiG50_n3qNnEgq7clgJ52DM04TCiViVS9hqgO9bIyrS8qpMgeG8lYaldbOEU_Y6zXhk" />
            </div>
          </div>
          {/* Menu Item Card 4 */}
          <div className="group flex gap-4 p-4 rounded-lg bg-surface-container-lowest transition-all hover:scale-[1.02] hover:bg-surface-container-highest">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-sm">fire_truck</span>
                <h3 className="text-on-surface font-bold text-lg leading-tight">Char-Grilled Salmon</h3>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">Atlantic salmon with a citrus glaze, served over a bed of quinoa and citrus segments.</p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-on-surface font-black text-lg tracking-tight">₹1,150</span>
                <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-lg active:scale-90 transition-all">
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </div>
            <div className="w-28 h-28 shrink-0 rounded-lg overflow-hidden">
              <img alt="Grilled Salmon" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRAijTNyC9rdz6kAPbvZsb8mVJz1XnFeSHIk_dYhH4qNsP3U3tGj5rdSdHDJIl4UMwhzaDOI0CZtpf92nQd9IMVYceVSzOkfPK8FQHHiaXs56THrTT8yJixg_1n0sEzDgAXtG_nfqWUom2hZXzVozp0vO5sUOClU9hFD2wabuWTLNvIfaFaTB4WuTmmxrn0-_AhJMsws8ekafinD62upwHATZBT-lZkOEquzpSr04TWO-O_kc3Td2VUL8X2RN7sXdvK6__5Z-B8sY" />
            </div>
          </div>
        </section>
      </main>
      {/* Order Drawer (Mobile Sticky Bar) */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-6 pb-6 pt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0px_-10px_30px_rgba(18,28,42,0.08)] rounded-t-[32px]">
        <div className="flex items-center justify-between bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-4 shadow-xl">
          <div className="flex items-center gap-3 pl-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">1 ITEM SELECTED</span>
              <span className="text-lg font-black tracking-tight">₹520</span>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-white text-primary px-6 py-2 rounded-full font-bold text-sm tracking-tight transition-transform active:scale-95">
            VIEW CART
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
      {/* Footer Content */}
      <footer className="w-full py-12 bg-surface-container-low dark:bg-slate-900 text-center space-y-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center">
          <span className="text-lg font-black text-[#121C2A] dark:text-white mb-4">The Curated Canvas</span>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Contact Us</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Terms of Service</a>
          </div>
          <p className="text-sm text-[#474554]">© 2024 The Curated Canvas. Physical layers for digital experiences.</p>
        </div>
      </footer>
    </div>
  );
}
