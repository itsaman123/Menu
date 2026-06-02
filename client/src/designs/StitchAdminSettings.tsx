export default function StitchAdminSettings(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-[#F8F9FF] dark:bg-slate-950 h-screen w-64 rounded-r-3xl z-40 hidden md:flex">
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center text-white font-black text-xl">S</div>
          <div>
            <h1 className="font-inter text-sm font-medium font-black text-indigo-700">SaaS Admin</h1>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Management Portal</p>
          </div>
        </div>
        <nav className="flex-1 flex flex-col gap-1 mt-4">
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 transition-all duration-300 ease-in-out font-inter text-sm font-medium" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 transition-all duration-300 ease-in-out font-inter text-sm font-medium" href="#">
            <span className="material-symbols-outlined">restaurant</span>
            Restaurants
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 transition-all duration-300 ease-in-out font-inter text-sm font-medium" href="#">
            <span className="material-symbols-outlined">payments</span>
            Subscriptions
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 transition-all duration-300 ease-in-out font-inter text-sm font-medium" href="#">
            <span className="material-symbols-outlined">analytics</span>
            Analytics
          </a>
          <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-indigo-600 font-bold rounded-full shadow-sm transition-all duration-300 ease-in-out font-inter text-sm font-medium" href="#">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
        </nav>
        <div className="mt-auto px-4 py-6 border-t border-outline-variant/15">
          <a className="flex items-center gap-3 text-slate-500 hover:text-error transition-colors font-inter text-sm font-medium" href="#">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </a>
        </div>
      </aside>
      {/* Top AppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)] md:pl-72">
        <div className="flex items-center gap-4">
          <span className="md:hidden material-symbols-outlined text-on-surface">menu</span>
          <span className="text-xl font-black bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] bg-clip-text text-transparent font-inter tracking-tight">The Curated Canvas</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-500">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container overflow-hidden">
            <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvZLMGTAgTYzbCVZMDs69Wa_0yKO94TLx5RWRFdiAXUihHXWG3PV4INd_JSsxlmlZCsp_7xVYzLQODjYegNVsFVAaHTqTo2uJh7XOweJ7axcCD6ZQ0a7pQuB8SjDOfszYiWjwdIksOLZOfI_J6TNC3_O_AUJ8jXu3kTJb5kmgdo9fkBUE6t2vE9algykMoeY1n32ALhZLxln8qliM7ZXf0T583hj668maId6oKk8SmwewGfgG3clWsbxkz8N2rnsGe3OIhEpYVOPQ" alt="Admin Profile" />
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="pt-24 pb-32 md:pl-72 px-6 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <header className="mb-12">
            <h2 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2">Settings</h2>
            <p className="text-on-surface-variant font-medium">Manage your restaurant identity and operational parameters.</p>
          </header>
          {/* Bento Grid Settings Sections */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Restaurant Profile Card */}
            <section className="md:col-span-8 bg-surface-container-lowest rounded-lg p-8 transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">Restaurant Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Restaurant Name</label>
                  <input className="h-14 bg-surface-container-low border-none rounded-DEFAULT px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="text" defaultValue="Indigo Terrace" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Phone Number</label>
                  <input className="h-14 bg-surface-container-low border-none rounded-DEFAULT px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="tel" defaultValue="+91 98765 43210" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Physical Address</label>
                  <textarea className="bg-surface-container-low border-none rounded-DEFAULT p-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" rows={3} defaultValue="Level 4, Skyview Corporate Park, Sector 44, Gurugram, Haryana 122003"></textarea>
                </div>
              </div>
            </section>
            {/* Subscription Status */}
            <section className="md:col-span-4 bg-primary-container rounded-lg p-8 text-white flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">Current Plan</span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">ACTIVE</span>
                </div>
                <h3 className="text-4xl font-black mb-1">Growth</h3>
                <p className="text-white/70 text-sm">Perfect for scaling businesses.</p>
              </div>
              <div className="mt-8">
                <ul className="flex flex-col gap-3 mb-8">
                  <li className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Unlimited Menus
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    QR Code Customization
                  </li>
                </ul>
                <button className="w-full h-12 bg-white text-primary font-bold rounded-DEFAULT hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                  Manage Subscription
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </button>
              </div>
            </section>
            {/* Appearance Customization */}
            <section className="md:col-span-6 bg-surface-container-lowest rounded-lg p-8 transition-transform hover:scale-[1.01]">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface">Appearance</h3>
              </div>
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-lg bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant group cursor-pointer hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">upload</span>
                    <span className="text-[8px] font-bold mt-2 text-slate-500 uppercase tracking-tighter">New Logo</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-on-surface mb-1">Brand Logo</h4>
                    <p className="text-xs text-on-surface-variant mb-3">Recommended size 512x512px. PNG or SVG preferred.</p>
                    <button className="px-4 py-2 bg-surface-container-high rounded-full text-xs font-bold text-on-secondary-container hover:bg-surface-container-highest transition-colors">Choose File</button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1 block mb-4">Primary Theme Color</label>
                  <div className="flex flex-wrap gap-4">
                    <button className="w-10 h-10 rounded-full bg-[#5341CD] ring-4 ring-primary-container ring-offset-2"></button>
                    <button className="w-10 h-10 rounded-full bg-[#E91E63] hover:scale-110 transition-transform"></button>
                    <button className="w-10 h-10 rounded-full bg-[#009688] hover:scale-110 transition-transform"></button>
                    <button className="w-10 h-10 rounded-full bg-[#FF9800] hover:scale-110 transition-transform"></button>
                    <button className="w-10 h-10 rounded-full bg-[#212121] hover:scale-110 transition-transform"></button>
                    <div className="w-10 h-10 rounded-full border-2 border-outline-variant flex items-center justify-center cursor-pointer hover:bg-slate-50">
                      <span className="material-symbols-outlined text-sm">colorize</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Business & Table Management */}
            <div className="md:col-span-6 grid grid-cols-1 gap-6">
              {/* Business Info */}
              <section className="bg-surface-container-lowest rounded-lg p-8 transition-transform hover:scale-[1.01]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">Business Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">GST Number</label>
                    <input className="h-12 bg-surface-container-low border-none rounded-DEFAULT px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" placeholder="06AAAAA0000A1Z5" type="text" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">Service Tax (%)</label>
                    <input className="h-12 bg-surface-container-low border-none rounded-DEFAULT px-4 focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="number" defaultValue={5} />
                  </div>
                </div>
              </section>
              {/* Table Management */}
              <section className="bg-surface-container-lowest rounded-lg p-8 transition-transform hover:scale-[1.01]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface">Table Management</h3>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1 block mb-1">Number of Tables</label>
                    <div className="flex items-center gap-4">
                      <input className="h-12 w-24 bg-surface-container-low border-none rounded-DEFAULT px-4 text-center font-bold text-primary text-xl focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" type="number" defaultValue={24} />
                      <span className="text-on-surface-variant text-sm font-medium">Auto-generate QR codes for each table.</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          {/* Global Action Bar */}
          <footer className="mt-12 flex items-center justify-between p-6 bg-surface-container-low rounded-lg">
            <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              Last saved on Oct 12, 2023 at 4:32 PM
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-4 text-on-surface-variant font-bold hover:text-on-surface transition-colors">Discard</button>
              <button className="px-10 py-4 bg-primary text-white font-bold rounded-DEFAULT shadow-[0px_10px_20px_rgba(83,65,205,0.2)] hover:scale-105 active:scale-95 transition-all">Save Changes</button>
            </div>
          </footer>
        </div>
      </main>
      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-[0px_-10px_30px_rgba(18,28,42,0.08)]">
        <a className="flex flex-col items-center justify-center text-slate-400 p-2" href="#">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2" href="#">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Menu</span>
        </a>
        <a className="flex flex-col items-center justify-center bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-3 transform -translate-y-4 shadow-lg" href="#">
          <span className="material-symbols-outlined">settings</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2" href="#">
          <span className="material-symbols-outlined">person_outline</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
