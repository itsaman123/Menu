export default function SuperAdminDashboard(): JSX.Element {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      {/* TopNavBar Shell */}
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0px_20px_40px_rgba(18,28,42,0.06)]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] bg-clip-text text-transparent">The Curated Canvas</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/15">
            <span className="material-symbols-outlined text-outline text-sm">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm text-on-surface-variant placeholder-on-surface-variant/50 w-64" placeholder="Search accounts..." type="text" />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-on-surface-variant">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold overflow-hidden border-2 border-white">
              <img alt="Admin Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5YsqfEBXRF2660OPdHLkP9NJTIN8ST_YD917kBUZaAfwYItA8UjRTUleS_PoZ_1JukbfimU_sRTbzrwNT4exFRXb4ZUIn3GjkW3J-x1QaZyHp4IWKhT4355jUr198Ha_RXI8CI36gDXlfMbq1LTlpAlVUwpP0PnO_jedD8M8ZJCz9DM2Ts8-Z13w8kA4zJOsU1jszfa1fWJ7xfKjLCTpjS3X53xQLbPf9Wfl9zjoNS4qk6NKV42PVxr582lrwhdX5D9fOPr1dm0w" />
            </div>
          </div>
        </div>
      </nav>
      {/* SideNavBar Shell */}
      <aside className="fixed left-0 top-0 h-full flex flex-col p-4 gap-2 bg-[#F8F9FF] dark:bg-slate-950 h-screen w-64 rounded-r-3xl z-40 pt-20">
        <div className="mb-8 px-4">
          <p className="font-black text-indigo-700 text-lg uppercase tracking-tight">SaaS Admin</p>
          <p className="text-slate-500 text-xs font-medium">Management Portal</p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-indigo-600 font-bold rounded-full shadow-sm transition-all duration-300 ease-in-out" href="#">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-inter text-sm font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 ease-in-out" href="#">
            <span className="material-symbols-outlined">restaurant</span>
            <span className="font-inter text-sm font-medium">Restaurants</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 ease-in-out" href="#">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-inter text-sm font-medium">Subscriptions</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 ease-in-out" href="#">
            <span className="material-symbols-outlined">analytics</span>
            <span className="font-inter text-sm font-medium">Analytics</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 ease-in-out" href="#">
            <span className="material-symbols-outlined">group</span>
            <span className="font-inter text-sm font-medium">Users</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all duration-300 ease-in-out" href="#">
            <span className="material-symbols-outlined">support_agent</span>
            <span className="font-inter text-sm font-medium">Tickets</span>
          </a>
        </nav>
        <div className="mt-auto px-4 py-6 border-t border-outline-variant/10">
          <button className="w-full bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white py-3 rounded-full font-bold text-sm shadow-lg shadow-indigo-200 active:scale-95 transition-all mb-4">
            New Restaurant
          </button>
          <a className="flex items-center gap-3 text-slate-500 hover:text-error transition-colors" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-inter text-sm font-medium">Logout</span>
          </a>
        </div>
      </aside>
      {/* Main Content Area */}
      <main className="ml-64 pt-24 pb-12 px-8 min-h-screen">
        {/* Dashboard Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-black text-on-surface tracking-tight mb-1">Platform Overview</h1>
          <p className="text-on-surface-variant font-medium">Monitoring growth across 1,240 partner locations.</p>
        </header>
        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">storefront</span>
            </div>
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Total Restaurants</p>
            <h2 className="text-4xl font-black text-on-surface">1,240</h2>
            <div className="mt-4 flex items-center text-secondary text-sm font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              <span>+12% this month</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">shopping_bag</span>
            </div>
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Total Orders</p>
            <h2 className="text-4xl font-black text-on-surface">45.2k</h2>
            <div className="mt-4 flex items-center text-secondary text-sm font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              <span>+8.4k new</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">payments</span>
            </div>
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Platform Revenue</p>
            <h2 className="text-4xl font-black text-on-surface">₹12.5L</h2>
            <div className="mt-4 flex items-center text-secondary text-sm font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              <span>+18% vs last month</span>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">verified_user</span>
            </div>
            <p className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-2">Active Subs</p>
            <h2 className="text-4xl font-black text-on-surface">890</h2>
            <div className="mt-4 flex items-center text-secondary text-sm font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              <span>94% retention rate</span>
            </div>
          </div>
        </div>
        {/* Revenue Chart & Key Metrics Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Monthly Revenue Growth Chart */}
          <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-lg">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Monthly Revenue Growth</h3>
                <p className="text-sm text-on-surface-variant">Performance across fiscal year 2024</p>
              </div>
              <select className="bg-surface-container-low border-none rounded-full px-4 py-2 text-sm font-medium text-on-surface focus:ring-primary focus:ring-2">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            {/* Visual Mock of Chart */}
            <div className="h-64 flex items-end justify-between gap-2">
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-surface-container-high rounded-t-lg h-24 group-hover:bg-primary/20 transition-colors"></div>
                <span className="text-xs font-bold text-on-surface-variant mt-3">JAN</span>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-surface-container-high rounded-t-lg h-32 group-hover:bg-primary/20 transition-colors"></div>
                <span className="text-xs font-bold text-on-surface-variant mt-3">FEB</span>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-surface-container-high rounded-t-lg h-40 group-hover:bg-primary/20 transition-colors"></div>
                <span className="text-xs font-bold text-on-surface-variant mt-3">MAR</span>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-primary rounded-t-lg h-48 group-hover:bg-primary-container transition-colors shadow-lg shadow-indigo-100"></div>
                <span className="text-xs font-bold text-primary mt-3">APR</span>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-surface-container-high rounded-t-lg h-52 group-hover:bg-primary/20 transition-colors"></div>
                <span className="text-xs font-bold text-on-surface-variant mt-3">MAY</span>
              </div>
              <div className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-surface-container-high rounded-t-lg h-60 group-hover:bg-primary/20 transition-colors"></div>
                <span className="text-xs font-bold text-on-surface-variant mt-3">JUN</span>
              </div>
            </div>
          </div>
          {/* Promotion / Quick Actions Card */}
          <div className="bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] p-8 rounded-lg text-white flex flex-col justify-between relative overflow-hidden">
            <div className="z-10">
              <h3 className="text-2xl font-black mb-2">Upgrade Engine</h3>
              <p className="text-on-primary-container/80 text-sm mb-6">Automated campaigns for Starter plan users are ready to launch.</p>
              <button className="bg-white text-primary font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all">Launch Campaign</button>
            </div>
            <div className="absolute -bottom-8 -right-8 opacity-20 transform rotate-12">
              <span className="material-symbols-outlined text-[120px]">rocket_launch</span>
            </div>
          </div>
        </div>
        {/* Recently Joined Restaurants Table */}
        <section className="bg-surface-container-lowest rounded-lg overflow-hidden">
          <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
            <h3 className="text-xl font-bold text-on-surface">Recently Joined Restaurants</h3>
            <button className="text-primary font-bold text-sm flex items-center hover:underline">
              View All Restaurants
              <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-8 py-4">Restaurant Name</th>
                  <th className="px-8 py-4">Owner</th>
                  <th className="px-8 py-4">Plan</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date Joined</th>
                  <th className="px-8 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4xwN6eW0yPeq-h_wzoisDTYpoYFBHhEastk5GEYRCDxMTYUaX4F4ukezXnj9vtmHcUecKqXFQYOGF4dTDAXwOPC0RYBxv8YTmC7U2t6EsyNkdX412h6g3OBY_u0dcg0WHUqSXTlwyuH7Y0oSJIxAakUlUqp89f9yJ1iL6TtGoMIZkPbMYKBF-Eioj1-SAinGpJOiglJp1_KJNccN1GkOE9te-dh2jPmNDNp6InPtaBi0jlw_2dvE8NJ6W02KA12CO0dFKkD3cqRo" alt="The Spice Route" />
                      </div>
                      <span className="font-bold text-on-surface">The Spice Route</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium">Rajesh Kumar</td>
                  <td className="px-8 py-5">
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Pro Plan</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="text-sm font-bold text-secondary">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium text-sm">Oct 24, 2023</td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBxtF4cJllGZuavU36fDhgsnvOF6Mzn1svv3P4g0lVndLi2BqbGiMI0jz1kQ0WbRy_rMHreDm_Jax4m1TB65S2uZpw5kQvyyWR_bcRUcExNtMo40vaPnSB7fuo2FD2JW0gfUco0w2D9-Wv2QzsAaTHkUPUxHQ8FHxTI0kIuisVwpq-d9wn76NH54iM7lTezxsqRZy3uZCA5YQX1oPJJU0LMCy5dSj-dIkPvOAy1XfEDJ1hOpFvjQ5gJDTODp-uro3_884dkOQOlB8" alt="Urban Brew Cafe" />
                      </div>
                      <span className="font-bold text-on-surface">Urban Brew Cafe</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium">Anita Sharma</td>
                  <td className="px-8 py-5">
                    <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Starter</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="text-sm font-bold text-secondary">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium text-sm">Oct 23, 2023</td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1HmfSSVTIclrGAQCeNYEbplBSd883JUx-Gjq41bd_5PlbNmO_jVeN3k7P5FGbj7D76zq76l7mJe8SRwgYENglpguarrO8w6xxTq8C-PsJ0CgqpQXp2J3wCHp5oUosP5kIC2ZandwEZUgXmgf92O-GjlgJggF46_7da2HQFWpAvH38HrIlWUJ1MMA_Gfb2WfiEU8Z18qE_u-oSUIuCMs7ptmL1JpD2NQAleMWW-U6HF9YW7rvbLY7Gncv2qY2oMIsf22WyPCZg4xE" alt="Sushi Sensation" />
                      </div>
                      <span className="font-bold text-on-surface">Sushi Sensation</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium">David Miller</td>
                  <td className="px-8 py-5">
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Pro Plan</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="text-sm font-bold text-tertiary">Pending</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium text-sm">Oct 22, 2023</td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center overflow-hidden">
                        <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyj_88X_nrKFMG4iHFyobr6-MKU91SvHgeRI6k-TBsI9-WVPftPu6mtA1QBnVYkqdWPeh4DY2fX6g2lxvAY7PIU7HXOxWRZPKuRSsFwH9Lt3SmM08dddl5eMYChGW_tR_igbD4Iv2z75M-Mwl8iCMHi65cFRibMDUGe_9DKIxZDKku8ctfynwydj6xF1LRP1CmvBhupWBiw_k1GDKJS9ebKN7hZ-i3tuGx1Q90Eua2_AkOWKCy_FM74N5fyC5hqwmak3LrUcjQd6I" alt="Gourmet Garden" />
                      </div>
                      <span className="font-bold text-on-surface">Gourmet Garden</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium">Sanjay Patil</td>
                  <td className="px-8 py-5">
                    <span className="bg-surface-container-high text-on-surface-variant text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Starter</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                      <span className="text-sm font-bold text-secondary">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant font-medium text-sm">Oct 21, 2023</td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-outline hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
      {/* BottomNavBar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20 pb-safe bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-[0px_-10px_30px_rgba(18,28,42,0.08)] rounded-t-[32px]">
        <a className="flex flex-col items-center justify-center bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] text-white rounded-full p-3 transform -translate-y-4 shadow-lg scale-110 duration-300" href="#">
          <span className="material-symbols-outlined">restaurant_menu</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Menu</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2" href="#">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Orders</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2" href="#">
          <span className="material-symbols-outlined">history</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">History</span>
        </a>
        <a className="flex flex-col items-center justify-center text-slate-400 p-2" href="#">
          <span className="material-symbols-outlined">person_outline</span>
          <span className="font-inter text-[10px] uppercase tracking-widest mt-1">Profile</span>
        </a>
      </nav>
    </div>
  );
}
