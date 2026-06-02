export default function StitchOrdersPage(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-50 flex flex-col py-8 px-4 gap-2 z-40 hidden md:flex">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-bold text-[#121C2A]">The Curated Canvas</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Premium Dining Admin</p>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          <a className="flex items-center gap-3 px-4 py-3 text-[#474554] mx-2 transition-all duration-200 ease-in-out hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium uppercase tracking-wider">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#474554] mx-2 transition-all duration-200 ease-in-out hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">restaurant_menu</span>
            <span className="text-sm font-medium uppercase tracking-wider">Menu Management</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-white text-[#5341CD] rounded-full shadow-sm mx-2 transition-all duration-200 ease-in-out" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>reorder</span>
            <span className="text-sm font-medium uppercase tracking-wider">Live Orders</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#474554] mx-2 transition-all duration-200 ease-in-out hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="text-sm font-medium uppercase tracking-wider">QR Generator</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-[#474554] mx-2 transition-all duration-200 ease-in-out hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">insights</span>
            <span className="text-sm font-medium uppercase tracking-wider">Analytics</span>
          </a>
        </nav>
        <div className="mt-auto px-2 flex flex-col gap-2">
          <div className="bg-primary-fixed p-4 rounded-xl mb-4">
            <p className="text-xs font-bold text-on-primary-fixed-variant uppercase tracking-tighter mb-2">Current Tier</p>
            <p className="text-sm font-bold text-on-primary-fixed mb-3">Enterprise Gold</p>
            <button className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg uppercase tracking-widest">Upgrade Plan</button>
          </div>
          <a className="flex items-center gap-3 px-4 py-2 text-[#474554] hover:bg-white/50 rounded-full transition-all" href="#">
            <span className="material-symbols-outlined text-sm">settings</span>
            <span className="text-xs font-medium uppercase tracking-wider">Settings</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-2 text-[#474554] hover:bg-white/50 rounded-full transition-all" href="#">
            <span className="material-symbols-outlined text-sm">contact_support</span>
            <span className="text-xs font-medium uppercase tracking-wider">Support</span>
          </a>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="md:ml-64 p-6 md:p-10 pb-32">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface">Live Orders</h2>
            <p className="text-on-surface-variant font-medium">Real-time floor management and kitchen synchronization.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-surface-container-low px-6 py-3 rounded-full flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-secondary">Kitchen Live</span>
            </div>
            <button className="bg-surface-container-highest p-3 rounded-full hover:scale-105 transition-transform">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </header>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-1 bg-surface-container-low p-6 rounded-lg">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Pending Orders</p>
            <p className="text-5xl font-black text-on-surface">12</p>
          </div>
          <div className="md:col-span-1 bg-primary-container p-6 rounded-lg text-on-primary-container">
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-4">Active Kitchen</p>
            <p className="text-5xl font-black">08</p>
          </div>
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-lg shadow-[0px_20px_40px_rgba(18,28,42,0.06)] flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Avg. Completion</p>
              <p className="text-5xl font-black text-on-surface">18<span className="text-xl ml-1 font-bold opacity-40">min</span></p>
            </div>
            <div className="h-16 w-32 bg-secondary-container/30 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary scale-150">trending_down</span>
            </div>
          </div>
        </div>
        {/* Orders Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Order Card 1: Preparing */}
          <div className="bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col shadow-[0px_20px_40px_rgba(18,28,42,0.04)] group hover:scale-[1.02] transition-all duration-300">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded">Priority</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">#ORD-2841</span>
                </div>
                <h3 className="text-2xl font-black text-on-surface">Table 04</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Wait Time</p>
                <p className="text-lg font-bold text-error">14m</p>
              </div>
            </div>
            <div className="p-6 flex-grow space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">2x Paneer Tikka (Special)</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹780</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">1x Butter Naan Basket</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹240</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">1x Dal Makhani (Regular)</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹450</span>
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-outline-variant/30 flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-on-surface">₹1,470</span>
              </div>
            </div>
            <div className="p-6 bg-surface-container-low grid grid-cols-2 gap-3">
              <button className="bg-surface-container-highest text-on-surface py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined text-sm">restaurant</span> Preparing
              </button>
              <button className="bg-primary text-white py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-sm">check_circle</span> Mark Ready
              </button>
            </div>
          </div>
          {/* Order Card 2: New */}
          <div className="bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col shadow-[0px_20px_40px_rgba(18,28,42,0.04)] group hover:scale-[1.02] transition-all duration-300">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">New Order</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">#ORD-2845</span>
                </div>
                <h3 className="text-2xl font-black text-on-surface">Table 12</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Wait Time</p>
                <p className="text-lg font-bold text-on-surface">02m</p>
              </div>
            </div>
            <div className="p-6 flex-grow space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">1x Signature Platter</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹1,250</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">2x Virgin Mojito</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹560</span>
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-outline-variant/30 flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-on-surface">₹1,810</span>
              </div>
            </div>
            <div className="p-6 bg-surface-container-low grid grid-cols-2 gap-3">
              <button className="bg-primary-container text-on-primary-container py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary-container/20">
                <span className="material-symbols-outlined text-sm">soup_kitchen</span> Preparing
              </button>
              <button className="bg-surface-container-high text-on-surface py-3 px-4 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-variant transition-colors">
                <span className="material-symbols-outlined text-sm">check_circle</span> Mark Ready
              </button>
            </div>
          </div>
          {/* Order Card 3: Ready/Pending Pickup */}
          <div className="bg-surface-container-lowest rounded-lg overflow-hidden flex flex-col shadow-[0px_20px_40px_rgba(18,28,42,0.04)] group hover:scale-[1.02] transition-all duration-300">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">#ORD-2839</span>
                </div>
                <h3 className="text-2xl font-black text-on-surface">Table 01</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</p>
                <p className="text-sm font-bold text-secondary uppercase tracking-widest">Ready</p>
              </div>
            </div>
            <div className="p-6 flex-grow space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">3x Masala Dosa</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹480</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface font-medium">3x Filter Coffee</span>
                  <span className="text-on-surface-variant text-sm font-bold">₹210</span>
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-outline-variant/30 flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-on-surface">₹690</span>
              </div>
            </div>
            <div className="p-6 bg-secondary-container/20 flex flex-col items-center justify-center text-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-xs font-bold text-on-secondary-container uppercase tracking-widest">Order Ready for Server</p>
              <button className="mt-2 text-[10px] font-black text-secondary uppercase tracking-tighter hover:underline">Re-send Notification</button>
            </div>
          </div>
          {/* Order Card 4: Quick Details */}
          <div className="bg-surface-container-low rounded-lg p-6 flex flex-col border border-outline-variant/20">
            <div className="flex items-start justify-between mb-6">
              <h3 className="text-xl font-black text-on-surface">Table 09</h3>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">#ORD-2849</span>
            </div>
            <div className="space-y-2 mb-8">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">4</span>
                <span className="text-sm text-on-surface-variant">Vegetable Biryani</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 rounded bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">1</span>
                <span className="text-sm text-on-surface-variant">Raita Tray</span>
              </div>
            </div>
            <div className="mt-auto">
              <button className="w-full bg-surface-container-lowest text-primary py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/10 hover:bg-white transition-all">
                View Details
              </button>
            </div>
          </div>
        </section>
        {/* Floating Quick Action (Mobile Only) */}
        <div className="md:hidden fixed bottom-24 right-6 z-50">
          <button className="h-16 w-16 rounded-full bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
            <span className="material-symbols-outlined scale-125">add</span>
          </button>
        </div>
      </main>
      {/* Bottom Navigation Bar (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-6 pb-6 pt-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-[0px_-10px_30px_rgba(18,28,42,0.08)] rounded-t-[32px]">
        <a className="text-[#474554] p-2 flex flex-col items-center gap-1 active:scale-95" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Home</span>
        </a>
        <a className="text-[#474554] p-2 flex flex-col items-center gap-1 active:scale-95" href="#">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Menu</span>
        </a>
        <a className="bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-3 mb-2 scale-110 flex flex-col items-center gap-1 active:scale-95 shadow-lg shadow-primary/30" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Orders</span>
        </a>
        <a className="text-[#474554] p-2 flex flex-col items-center gap-1 active:scale-95" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </a>
      </nav>
      {/* Order Drawer (Hidden by default) */}
      <div className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-50 hidden" id="order-drawer">
        <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl rounded-t-[32px] p-8 pb-12 shadow-2xl transition-transform transform translate-y-full">
          <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6"></div>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h4 className="text-3xl font-black text-on-surface">Order Details</h4>
              <p className="text-on-surface-variant font-medium">Table 04 • ORD-2841</p>
            </div>
            <button className="p-2 bg-surface-container-low rounded-full">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
