export default function StitchOrderHistory(): JSX.Element {
  return (
    <div className="bg-surface font-body text-on-surface antialiased pb-32">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] bg-clip-text text-transparent">The Curated Canvas</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden ml-2 ring-2 ring-primary/10">
            <img alt="Admin Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3HiJ6mfz7aW9_HYNOOZUcLVbm5sXbskkjG51eKAIhuckIh2gVfVUZxo7eim6iHbLNnWIC11jXVp_5MOEBWr7RSzFtsAN63zQxna2k5KMqw3G4zdkBYyh99Tn-ATc8wnYmeeDNdypxI7AXiJ_DAGJK1hh6svOoLnZuqcH5u6CC6xgoPYZNeGOkiV6NbSU9yEQkECjr9CN6MzJ0vKxeVxm2ssIpvrhrE9BJeQ3FOGKLKYfAL7PVHB-LVWvAedsl3YpoVSqS3nERD2o" />
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="mb-10">
          <span className="font-label text-[10px] uppercase tracking-widest text-primary font-bold mb-2 block">Gastronomy Log</span>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Order History</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Relive your finest dining moments.</p>
        </section>
        {/* List of Orders */}
        <div className="space-y-8">
          {/* Active/Recent Order Card (Featured Asymmetric) */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-br from-primary to-primary-container rounded-lg blur opacity-5 transition duration-1000 group-hover:opacity-10"></div>
            <div className="relative bg-surface-container-lowest rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.01]" style={{ boxShadow: '0px 20px 40px rgba(18, 28, 42, 0.06)' }}>
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
                  <img alt="Order Thumbnail" className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQduI0fqmdrPuDZxSnh1fu65H5H1EopVCwinQgh9NhWeB_6KxJZYUPq0YPut8RdDRTONtjBm13v6aOHh7LPQOIG9hqbnLQdR2X4fK41FFyzSn6lvTZ8v62ab2VcrMf5-Q47Dy-q5yQmuTKzV_fYYvfKl89bfj5TtXKDONyqk5Ap_cwRZt5HXNNq2Dt-9UDFcCWE8OXtRTIafzE17e9qrz9QuVGGhuZ2cUcPR7tJ0gtpmY0Saam6DEQPvWCtW94KcB9ackB70rdccQ" />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-headline font-bold text-xl text-on-surface">Order #CC-42910</h3>
                        <p className="text-on-surface-variant text-sm font-medium">24 Oct, 2023 • 08:15 PM</p>
                      </div>
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>
                    </div>
                    <div className="space-y-1 mb-6">
                      <p className="text-on-surface-variant flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                        1x Burrata Salad
                      </p>
                      <p className="text-on-surface-variant flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
                        2x Ginger Ale
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                    <span className="text-2xl font-black text-on-surface">₹950</span>
                    <button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm">
                      <span className="material-symbols-outlined text-sm">reorder</span>
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Standard Card 2 */}
          <div className="bg-surface-container-low rounded-lg p-6 flex items-center justify-between transition-all hover:bg-surface-container-highest">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
                <img alt="Order Food" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgl-_nt7vhqtDve31Rfkgq1mhM08pjJt0ieNVJVALV6fPmp70DnxLllJaiT6LhapuJTAmWdH7DRQ6QskRXcuPzuvZfPN2MqwAF_3E0FqzFewDnGY9u_rnU2InoOfgxkX14LtVAibspEALuK1aCNTVfYtmWjhIbP57ttUC7QOll6iLqII5lbtZkv-KJdDDjN7-qYfRyIGVjWdxSePvMysYl004dSwuEgFaXsU0EqXvzqClmzlUnOrcTWyf_-eqFUkC9iZl31-TmlL8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-on-surface">#CC-41822</h4>
                  <span className="text-xs text-on-surface-variant">• 12 Oct</span>
                </div>
                <p className="text-sm text-on-surface-variant">3x Truffle Pasta, 1x Coke</p>
                <p className="text-sm font-bold text-primary mt-1">₹1,420</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>
              <button className="text-primary font-bold text-sm hover:underline">Details</button>
            </div>
          </div>
          {/* Standard Card 3 (Cancelled) */}
          <div className="bg-surface-container-low rounded-lg p-6 flex items-center justify-between opacity-80">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center grayscale">
                <img alt="Order Food" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVgrmZGuxmJewbZ_cFN2izbn8APwwBJozNDRWsQjs8cgA9gUd9gFjdi_mcEzDXQxOiPKVwU6KfeTjIoiSSIwaebXsJ8YqxDeFxP4PouZmzwzYwed8Jqy3fFxurkKrvHbxJtb81avwZZkoAF864AMMUAjBcYuMyL_MNnMFO7SxqArRAw5Q6_tgnwn5FeHwo1IE0WC7PtMtFZN2PklCyOWS2ePHUw637yNEt-_KloF_DxEX5L84flWxl8O_hjuRkKDjkq9NiESWw9B8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-on-surface">#CC-40551</h4>
                  <span className="text-xs text-on-surface-variant">• 05 Oct</span>
                </div>
                <p className="text-sm text-on-surface-variant">1x Salmon Poke Bowl</p>
                <p className="text-sm font-bold text-on-surface-variant mt-1">₹680</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Cancelled</span>
              <button className="text-outline font-bold text-sm">Dismiss</button>
            </div>
          </div>
          {/* Standard Card 4 */}
          <div className="bg-surface-container-low rounded-lg p-6 flex items-center justify-between transition-all hover:bg-surface-container-highest">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center">
                <img alt="Order Food" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiWgyF8LIr0U-c-PZbDVrbBXyamVhVUKHCRMZe-oyIvJngzW2YMuKY-mJFSUlCuVm_bLL8qWwZ86W551rKTqTL6wr4LxrG2tKU7Js9rWIz-z2jrPwMdxJVhubGeAxYft3e784W3WJha3nFyL17RTv11W_3ZJMy2VhhgfU3mhMBYWdrvQ8U7LtNUHe-kmhgla9-c0rGMRoAd3q8hDaBJegnJCLAb5JcStiMv9fF6Mkd8FZ8eR2R5rZ4LQ3Axe4ooFIWf5jtrXJ6C4M" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-on-surface">#CC-39210</h4>
                  <span className="text-xs text-on-surface-variant">• 22 Sep</span>
                </div>
                <p className="text-sm text-on-surface-variant">2x Arrabiata Pasta</p>
                <p className="text-sm font-bold text-primary mt-1">₹890</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Completed</span>
              <button className="bg-surface-container-highest text-primary px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-95">Reorder</button>
            </div>
          </div>
        </div>
      </main>
      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-[0px_-10px_30px_rgba(18,28,42,0.08)] rounded-t-[32px]">
        <a className="flex flex-col items-center justify-center text-slate-400 p-2 hover:text-indigo-500 transition-all duration-300" href="#">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Menu</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2 hover:text-indigo-500 transition-all duration-300" href="#">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Orders</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-3 transform -translate-y-4 shadow-lg scale-110 transition-all duration-300" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="font-inter text-[8px] uppercase tracking-widest mt-0.5">History</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2 hover:text-indigo-500 transition-all duration-300" href="#">
          <span className="material-symbols-outlined">person_outline</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
