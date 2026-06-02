export default function StitchMenuMgmt(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface">
      {/* Top Navigation Anchor */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="text-2xl font-black tracking-tighter text-[#121C2A] dark:text-white">
            The Curated Canvas
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-8">
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#">Features</a>
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#">Pricing</a>
              <a className="font-semibold tracking-tight text-[#5341CD] border-b-2 border-[#5341CD] pb-1 transition-all duration-300" href="#">Admin</a>
              <a className="font-semibold tracking-tight text-[#474554] hover:text-[#121C2A] transition-all duration-300" href="#">Help</a>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <button className="bg-surface-container-low p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-all">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <img alt="Admin Profile" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtqA-Gv8nk2pHz5etN1YEJLnRnFpe2bg-Psnw9rDE2h_nxcWgK7PdOqpvWcf8Qh1C3ZTi0pTSdYeP1wCk6LZ2UezxwPmRFnP7kpqoLdj7SIcAOEpO2umtAZzBOiYzoUNSxgRiFlP8fvwc5JV30fjcYiLE8EzZKGC7fUqDMATSAYPi7N6M_JJDBqehH2UFf-lfY0E_QL07hivaT2CjZyhVmdPaWr_2X9owI92xkFwPaHD2NfYjYfHw0EBoFRXzqPrc8ZyfMC6TQ8b8" />
            </div>
          </div>
        </div>
      </header>
      {/* Sidebar Wrapper */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 flex flex-col py-8 px-4 gap-2 pt-28">
        <div className="px-4 mb-6">
          <h2 className="text-[#121C2A] font-bold text-xl">The Curated Canvas</h2>
          <p className="text-xs font-medium uppercase tracking-wider text-[#474554] opacity-70">Premium Dining Admin</p>
        </div>
        <nav className="flex flex-col gap-1">
          <a className="flex items-center gap-3 py-3 px-4 text-[#474554] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all duration-200" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium uppercase tracking-wider">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 bg-white dark:bg-slate-800 text-[#5341CD] rounded-full shadow-sm transition-all duration-200" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant_menu</span>
            <span className="text-sm font-medium uppercase tracking-wider">Menu Management</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 text-[#474554] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all duration-200" href="#">
            <span className="material-symbols-outlined">reorder</span>
            <span className="text-sm font-medium uppercase tracking-wider">Live Orders</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 text-[#474554] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all duration-200" href="#">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="text-sm font-medium uppercase tracking-wider">QR Generator</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 text-[#474554] hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-full transition-all duration-200" href="#">
            <span className="material-symbols-outlined">insights</span>
            <span className="text-sm font-medium uppercase tracking-wider">Analytics</span>
          </a>
        </nav>
        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-outline-variant/10">
          <a className="flex items-center gap-3 py-3 px-4 text-[#474554] hover:bg-white/50 rounded-full transition-all" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium uppercase tracking-wider">Settings</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 text-[#474554] hover:bg-white/50 rounded-full transition-all" href="#">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-sm font-medium uppercase tracking-wider">Support</span>
          </a>
          <div className="px-4 py-4 mt-2">
            <button className="w-full bg-primary-container text-on-primary-container py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
              Upgrade Plan
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content Canvas */}
      <main className="ml-64 pt-28 pb-20 px-10 min-h-screen">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Administration</span>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter leading-none">Menu Management</h1>
            <p className="text-on-surface-variant max-w-lg text-lg">Curate your digital culinary experience. Manage items, update pricing, and control real-time availability.</p>
          </div>
          <button className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all group">
            <span className="material-symbols-outlined">add_circle</span>
            Add New Item
          </button>
        </div>
        {/* Filter & Search Bar Layer */}
        <div className="bg-surface-container-low rounded-lg p-4 flex flex-wrap items-center gap-4 mb-10">
          <div className="flex-1 min-w-[300px] relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="w-full bg-surface-container-lowest border-none h-14 pl-12 pr-6 rounded-full focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline/60" placeholder="Search dish name or ingredient..." type="text" />
          </div>
          <div className="flex gap-2 p-1 bg-surface-container-high rounded-full">
            <button className="px-6 py-2 bg-white text-primary font-bold text-sm rounded-full shadow-sm">All Items</button>
            <button className="px-6 py-2 text-on-surface-variant font-semibold text-sm hover:text-on-surface">Starters</button>
            <button className="px-6 py-2 text-on-surface-variant font-semibold text-sm hover:text-on-surface">Main Course</button>
            <button className="px-6 py-2 text-on-surface-variant font-semibold text-sm hover:text-on-surface">Drinks</button>
            <button className="px-6 py-2 text-on-surface-variant font-semibold text-sm hover:text-on-surface">Desserts</button>
          </div>
        </div>
        {/* Bento Grid of Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Item Card 1 */}
          <div className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="h-64 overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDncNAYrRkIp6HGz6uljMUSJFRW8JLJL-otXWfk-sS45Avzd6uZApjL645oKkWnE14zVqpThbDavSZfQPQ1uKCkcLha-aaOjF6UFJuaRxc_RSztpAqgTUXvDca9Cz2d07Xd9pF1hakJ6RGZz5KgoIifxQaA7BAiq8APTQ0QtOHHL4dmL42XV_wOduaskWdxD8W4pU7I6FOEFYn3lNQos0_8Q7pUczxSOwybrbYzGx4QFeFrGbtWXnKYyR13cnrZxi_LSc6xxxtRe70" alt="Zesty Avocado Bowl" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Veg</span>
                <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Bestseller</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-on-surface leading-tight">Zesty Avocado Bowl</h3>
                <span className="text-2xl font-black text-primary">₹450</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Smashed organic avocado, quinoa, pickled radish, and lemon-tahini drizzle.</p>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Available</span>
                  <div className="w-12 h-6 bg-secondary-container rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                  <button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          </div>
          {/* Item Card 2 */}
          <div className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="h-64 overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm6q1bVa_-WeNmFXzWdKilHk4GExDE5a1EXaJBS-iaMvHnq7dz8lbWdAX0vD2lWWVfTGXEPUBOFUFhGfhQhLgKg28SYjNy_bD_8XokPHeV5wJP0qsemmvRg-4-sFqcTe-0mWur0vjIVeXCLzVX_Futq5uCYP-bPaJmj3zU-w3M3tj5PG9lzRzMBd5tt_MyTzcTujy191ingC1g1fMq_M4VOphP1xgO9rV5E72UkxNIjFhhcVZZpUJOhsUiZYpoJ9YS2Wp9ERVmR9s" alt="Fire-Roasted Pepperoni" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-error/10 text-error px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Non-Veg</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-on-surface leading-tight">Fire-Roasted Pepperoni</h3>
                <span className="text-2xl font-black text-primary">₹680</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">48-hour fermented sourdough, premium pepperoni, and buffalo mozzarella.</p>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Available</span>
                  <div className="w-12 h-6 bg-secondary-container rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                  <button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          </div>
          {/* Item Card 3 (Out of Stock State) */}
          <div className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="h-64 overflow-hidden relative grayscale opacity-60">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDalfL2kLeuRnjPZIq9IePxYT8uReesalRbS_gsfjDfTCROSkPtTAdjlIm5Fjdyu7AtQshsvYf4qRym57hS65IkMfil7BWZNq-nuH1PuTQ9CGcrNuXHLiCwqVqn4GLSYzK99Dbp-g5h5e-ZrlJpoFvPUroFtbh0Cceu-LAMYUaxNXBHIP5NR6U1Xpg5twtO4jSGOn9P8TfBC7Xm7rQl6JnrHY6HiLPg_w_CwCM7hMK7Wh8I1RdGqnk8Nt5egmq8t1fXadOtSvzAjo" alt="Midnight Mojito" />
              <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center">
                <span className="bg-white text-on-surface px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs">Out of Stock</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-on-surface leading-tight">Midnight Mojito</h3>
                <span className="text-2xl font-black text-outline">₹320</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">Blackberry infused mint, lime juice, and a splash of sparkling soda.</p>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Available</span>
                  <div className="w-12 h-6 bg-surface-container-high rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute left-1"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                  <button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          </div>
          {/* Item Card 4 */}
          <div className="group relative bg-surface-container-lowest rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
            <div className="h-64 overflow-hidden relative">
              <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDROPqY_tJJjfWN7aGWOi95da9UJriLbGL9dKJ2KtNbCrjUHeOc9egXP6RIozxdtp9n8T5MhRMjIYMuxmUQSoy_GNw7aiaRQAr8Y-sOGA2zO8dKVVxYMLAEnbqPOONJAsCzh3Y2xer4OLdjPA5quSiVd95_svG3n1VNya0gO1JJV5limc-Shk_BLNkj8vb4-lHZz4lrsx1QnepTshC5KkpUyz1zRNWuiga0y9NQC9ovQWYVsLAeAIFqODuYUiYx1xHyHOBY9V7v07M" alt="Salted Caramel Donut" />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Veg</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold text-on-surface leading-tight">Salted Caramel Donut</h3>
                <span className="text-2xl font-black text-primary">₹220</span>
              </div>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">House-made brioche donut filled with Belgian dark chocolate ganache.</p>
              <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Available</span>
                  <div className="w-12 h-6 bg-secondary-container rounded-full relative p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">edit</span></button>
                  <button className="p-2 text-on-surface-variant hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            </div>
          </div>
          {/* Add New Placeholder */}
          <div className="group relative border-4 border-dashed border-outline-variant/20 rounded-lg flex flex-col items-center justify-center p-10 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
            <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all">
              <span className="material-symbols-outlined text-4xl text-outline group-hover:text-primary">add_circle</span>
            </div>
            <h3 className="text-xl font-bold text-on-surface">Add New Selection</h3>
            <p className="text-on-surface-variant text-sm mt-2">Expand your menu with a new signature dish.</p>
          </div>
        </div>
      </main>
      {/* Footer Area */}
      <footer className="ml-64 bg-[#EFF4FF] dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-8">
          <div className="text-lg font-black text-[#121C2A] dark:text-white">The Curated Canvas</div>
          <div className="flex gap-8 text-sm text-[#474554]">
            <a className="hover:text-[#121C2A] underline transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#121C2A] underline transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-[#121C2A] underline transition-colors" href="#">Contact Us</a>
            <a className="hover:text-[#121C2A] underline transition-colors" href="#">Documentation</a>
          </div>
          <p className="text-sm text-[#474554]">© 2024 The Curated Canvas. Physical layers for digital experiences.</p>
        </div>
      </footer>
    </div>
  );
}
