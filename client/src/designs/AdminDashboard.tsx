export default function AdminDashboard(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface antialiased">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col py-8 px-4 gap-2 h-screen w-64 fixed left-0 top-0 bg-slate-50 z-40">
        <div className="px-4 mb-8">
          <h1 className="text-xl font-bold text-[#121C2A]">The Curated Canvas</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Premium Dining Admin</p>
        </div>
        <nav className="flex-1 space-y-1">
          <a className="flex items-center gap-3 py-3 px-4 transition-all duration-200 bg-white text-[#5341CD] rounded-full shadow-sm mx-2" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 transition-all duration-200 text-[#474554] mx-2 hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">restaurant_menu</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">Menu Management</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 transition-all duration-200 text-[#474554] mx-2 hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">reorder</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">Live Orders</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 transition-all duration-200 text-[#474554] mx-2 hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">qr_code</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">QR Generator</span>
          </a>
          <a className="flex items-center gap-3 py-3 px-4 transition-all duration-200 text-[#474554] mx-2 hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">insights</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">Analytics</span>
          </a>
        </nav>
        <div className="mt-auto px-4 py-6 bg-[#EFF4FF] rounded-lg mx-2 mb-6">
          <p className="text-xs font-bold text-on-surface-variant mb-3 uppercase tracking-wider">Storage Used</p>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary w-3/4"></div>
          </div>
          <button className="mt-4 w-full py-2 bg-primary-container text-on-primary-container text-xs font-bold rounded-full transition-all active:scale-95">Upgrade Plan</button>
        </div>
        <div className="space-y-1">
          <a className="flex items-center gap-3 py-2 px-4 transition-all duration-200 text-[#474554] mx-2 hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">Settings</span>
          </a>
          <a className="flex items-center gap-3 py-2 px-4 transition-all duration-200 text-[#474554] mx-2 hover:bg-white/50 rounded-full" href="#">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="font-['Inter'] text-sm font-medium uppercase tracking-wider">Support</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen pb-24 md:pb-12 px-6 pt-8 max-w-7xl">
        <header className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter text-on-surface">Dashboard</h2>
            <p className="text-on-surface-variant font-medium mt-1">Welcome back, Indigo Bistro Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-surface-container-low rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="flex items-center gap-3 bg-surface-container-low pl-2 pr-4 py-2 rounded-full">
              <img alt="Admin Profile" className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuARMnDDGIci2Z-DpOdicFT0DeNYUdJh5iS-ptQee2T1Y57f8CoQSPM6b8xkAi0PEMxZ4OAmqMgaOgOcJ6gyDc7LA3PVunuieyI27y9dICvEFrQr8doBJLLjLks65w6-1QnQS1IIMy7eTSoBGKAU_78by1Hox3-o5QnhvJuoqAaU-6D7wuUZpoWcL7fNJp3aKm03HrIeNh8O1cT2tjpAig286m1R1wuP2-BS35llvXVdAOXiNtif2X-7CjJlVeWjub8UmaRvEOtmaUA" />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-on-surface leading-none">Rajesh K.</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_20px_40px_rgba(18,28,42,0.06)] relative overflow-hidden group">
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontSize: '32px' }}>shopping_bag</span>
              <h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mb-1">Total Orders Today</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-on-surface tracking-tighter">142</span>
                <span className="text-secondary text-sm font-bold">+12%</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="material-symbols-outlined" style={{ fontSize: '120px' }}>trending_up</span>
            </div>
          </div>
          <div className="bg-primary text-white p-8 rounded-lg shadow-[0px_20px_40px_rgba(18,28,42,0.12)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#5341CD] to-[#6C5CE7]"></div>
            <div className="relative z-10">
              <span className="material-symbols-outlined text-primary-fixed mb-4 block" style={{ fontSize: '32px' }}>payments</span>
              <h3 className="text-primary-fixed/80 text-sm font-bold uppercase tracking-widest mb-1">Revenue</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tighter">₹42,850</span>
                <span className="text-secondary-fixed text-sm font-bold">+8.4%</span>
              </div>
            </div>
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_20px_40px_rgba(18,28,42,0.06)] group">
            <span className="material-symbols-outlined text-tertiary mb-4 block" style={{ fontSize: '32px' }}>restaurant</span>
            <h3 className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mb-1">Active Menu Items</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-on-surface tracking-tighter">84</span>
              <span className="text-on-surface-variant/60 text-sm font-medium">/ 120 Total</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-on-surface">Recent Orders</h3>
              <button className="text-primary text-sm font-bold hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { initials: 'AS', name: 'Ananya Sharma', detail: 'Table 04 • 3 Items', amount: '₹1,240.00', status: 'Preparing', statusBg: 'bg-secondary-container', statusColor: 'text-on-secondary-container' },
                { initials: 'RK', name: 'Rohan Kapoor',  detail: 'Takeaway • 1 Item',  amount: '₹450.00',   status: 'Pending',   statusBg: 'bg-tertiary-fixed',      statusColor: 'text-on-tertiary-fixed' },
                { initials: 'MD', name: 'Meera Das',     detail: 'Table 12 • 5 Items', amount: '₹2,890.00', status: 'Preparing', statusBg: 'bg-secondary-container', statusColor: 'text-on-secondary-container' },
                { initials: 'PV', name: 'Priya Verma',   detail: 'Table 08 • 2 Items', amount: '₹860.00',   status: 'Pending',   statusBg: 'bg-tertiary-fixed',      statusColor: 'text-on-tertiary-fixed' },
              ].map(order => (
                <div key={order.name} className="bg-surface-container-lowest p-6 rounded-lg flex items-center justify-between hover:bg-surface-container transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center font-bold text-primary">{order.initials}</div>
                    <div>
                      <h4 className="font-bold text-on-surface">{order.name}</h4>
                      <p className="text-xs text-on-surface-variant">{order.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-on-surface">{order.amount}</p>
                    <span className={`inline-block px-3 py-1 ${order.statusBg} ${order.statusColor} text-[10px] font-black uppercase tracking-widest rounded-full mt-1`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-low p-8 rounded-lg">
              <h3 className="text-xl font-bold tracking-tight text-on-surface mb-6">Top Sellers</h3>
              <div className="space-y-6">
                {[
                  { category: 'Burger', name: 'Crispy Paneer Burger', orders: '42 orders today', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyWmlKBGBHb7FX96JdfJuVqfXLE_eBuiKamYDfcP5K0AcNZ8ds9SbkYDlPsu4hUPHUoDH2FiDcYMrmWdYu38fepEmocYH0bArNSGWCYmkOObCuG9KymNf85qx2mu1SUCeKixsYWT1tvsJ7ZTmJe0lq2zd17MWJ3m2Msasnm9n7Sgvlo3U3bzAKeWQRRb42gSdcDjrCh26Y8ntz1f71L60ba9Tzfal9D6U36GVPoRaG92pHXTeUqEZeWdsxKlcf9nMZ5smE6OWdpww' },
                  { category: 'Brunch', name: 'Zesty Avocado Toast',  orders: '38 orders today', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARcYZ8_sNXq6_g0dbhAVs5t-jhT3wC5TJs-y7rhnXravMSXNJoms9acca2doGH0yi_VtT5gPj2z50evmO9Y97pWkUkflVXUHxYymF2RtTdAMzJIDUF_6lI1bo8vWmhTuDB1VX3VkuOqpv1v2_4QJj6iKnvMYUZL0cFNRDaSmGk6Vf9NM1Vk57oFxdX6uTIaPGDE9RvVp1YndRbeuAB2ykSK5F5Y3i-9f3gG8Hwl-dSwLv0CNhJonoQCihKihBe9x3LKaXYYH2Qx2g' },
                ].map(item => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-surface-container-lowest overflow-hidden flex-shrink-0">
                      <img alt={item.name} className="w-full h-full object-cover" src={item.img} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">{item.category}</p>
                      <h4 className="font-bold text-on-surface text-sm leading-tight">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant mt-1">{item.orders}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#EFF4FF] p-8 rounded-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold tracking-tight text-on-surface mb-2">Grow your reach</h3>
                <p className="text-sm text-on-surface-variant mb-6">Create a new weekend special menu and boost sales by up to 20%.</p>
                <button className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:shadow-lg transition-all">Create Promo</button>
              </div>
              <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-end px-6 pb-6 pt-2 bg-white/90 backdrop-blur-2xl rounded-t-[32px] shadow-[0px_-10px_30px_rgba(18,28,42,0.08)]">
        <a className="flex flex-col items-center bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-3 mb-2 scale-110" href="#">
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
        </a>
        <a className="flex flex-col items-center text-[#474554] p-2" href="#">
          <span className="material-symbols-outlined">menu_book</span>
          <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Menu</span>
        </a>
        <a className="flex flex-col items-center text-[#474554] p-2" href="#">
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Orders</span>
        </a>
        <a className="flex flex-col items-center text-[#474554] p-2" href="#">
          <span className="material-symbols-outlined">person</span>
          <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">Profile</span>
        </a>
      </nav>

      <footer className="w-full py-12 mt-12 bg-[#EFF4FF]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center space-y-8">
          <h4 className="text-lg font-black text-[#121C2A]">The Curated Canvas</h4>
          <nav className="flex flex-wrap justify-center gap-8">
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Privacy Policy</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Terms of Service</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Contact Us</a>
            <a className="text-sm text-[#474554] hover:text-[#121C2A] underline transition-colors" href="#">Documentation</a>
          </nav>
          <p className="text-sm text-[#474554]">© 2024 The Curated Canvas. Physical layers for digital experiences.</p>
        </div>
      </footer>
    </div>
  );
}
