export default function Login(): JSX.Element {
  return (
    <body className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <main className="w-full max-w-[1200px] grid md:grid-cols-2 gap-0 bg-surface-container-lowest rounded-lg overflow-hidden shadow-[0px_20px_40px_rgba(18,28,42,0.06)] min-h-[700px]">
        {/* Left Column: Editorial Imagery & Brand Messaging */}
        <section className="hidden md:flex flex-col justify-between p-12 bg-surface-container-low relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-12">
              <span className="text-xl font-black bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] bg-clip-text text-transparent tracking-tight">The Curated Canvas</span>
            </div>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter leading-[1.1] mb-6">
              Elevate your <br /> digital presence.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Join a community of forward-thinking creators and businesses using high-end editorial interfaces to tell their stories.
            </p>
          </div>
          <div className="mt-8 relative z-10">
            <div className="flex items-center gap-4 p-4 bg-surface-container-lowest/60 backdrop-blur-md rounded-DEFAULT w-fit shadow-sm border border-white/20">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-surface-container-lowest" alt="portrait of a young smiling professional designer" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdz2ebsH3mqwDtEkMQvE1eFn87gMZqFBdgOO45J0lg4_XmV8mx02SJO7ZR97HLgURT86EMDiA43TsH-43rI0hEjr8r5sTFcTaGGkyD-qzLgd80cv709xASGpjb3LWNUjm-l9zLIr-540Io7hlY8u8SD77Hp52ilyIrVD04AtzhdzAbgJt67I4YCrYtSJPxQLMwbGhiIZ0_YdZpiJN4277caauAKu91kwEDoAcw2XQx_PJp9_7tzX7M2SL2v0chwMd_HbKDXpQvb7I" />
                <img className="w-8 h-8 rounded-full border-2 border-surface-container-lowest" alt="modern businessman profile photo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFPck-P1iSNSgw9TMZBBzCYUQ6xymjhkN20z5z14gfEfuj3x0iofrMXrjGmm1-lZ3UZIpZWgZpgwkzdqRwgliPaggOCnawYZZZkPrATJCvkcOAC5Uwfs_ccf556qrIJs_MKy6wwvDpDFtnR1IKzd1ahW9F1gjaoc54TC59GzY3QyIUCqOZZEulr0qHDiMSThLzoPpwyDrQVp01nQvNlebj3vQdxj21-O7KLSJcXl6JQfki10LVLKZDdrirraxSSm3xlC8-0sWC9mM" />
                <img className="w-8 h-8 rounded-full border-2 border-surface-container-lowest" alt="creative female entrepreneur" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4vqQzJryJxMJGvAbozjPdO3MMbmQkLhy7pFjqyQnu6LNh_qhlhwOVcOP9MDTyH_xhvfuwrx15fFgjAbtCsbhzE_kKqf1doSo6r5k4rkdBD0HGRCScCddWJDK5MajaO8HLisL7dzdWNqz18E21PeYVsKxYAI9p2oUgeC1YTrHDQNwCKWuoyQ10_ZCIrQtuVjpU34OUYFcldoJsz1L6yvHwEinPkHiWb_bhobtdMtVrzWbZGcgz2SHttKzk3FuZm3ekVoX75RctDTA" />
              </div>
              <span className="text-sm font-medium text-on-surface-variant">Trusted by 2k+ curators</span>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-3/4 h-1/2 opacity-20 pointer-events-none">
            <img className="w-full h-full object-cover grayscale" alt="minimalist interior design" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlAYKAJZEpE8xOO8vwb_hRATTmDEI9nlC25WWCODU7_uvPEzOGwPlsHakkieJ5BysWAPam1CJHbGHJ37xi-ABDAj-AzGxk0yB9V1EefHXBX8qMdaU1kEqTi9eijty5hYDJ8ZCoLyrTHaGVyiPhfmjZ9bVtONyphFyYHfq0ZQXx9Lgb55WKaKKKh0mnMN-ptsVXZ1fgLPO3SGCKwKgY3h9WuwkqhkZy6NkPgBVBLLzmGgPeixRCEJYFQlNo0-QBAdhQqP1x-9ufYnU" />
          </div>
        </section>

        {/* Right Column: Login Form */}
        <section className="flex flex-col justify-center items-center p-8 md:p-16 bg-surface-container-lowest">
          <div className="w-full max-w-[400px]">
            <div className="md:hidden mb-12 text-center">
              <span className="text-xl font-black bg-gradient-to-br from-[#5341CD] to-[#6C5CE7] bg-clip-text text-transparent tracking-tight">The Curated Canvas</span>
            </div>
            <header className="mb-10">
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Welcome Back.</h2>
              <p className="text-on-surface-variant font-medium">Please enter your details to continue.</p>
            </header>
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-on-surface-variant block ml-1" htmlFor="email">Email address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                  <input className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-DEFAULT text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300" id="email" placeholder="name@company.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.1em] font-bold text-on-surface-variant block ml-1" htmlFor="password">Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-DEFAULT text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all duration-300" id="password" placeholder="••••••••" type="password" />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input className="peer appearance-none w-5 h-5 bg-surface-container-low rounded-md border-none checked:bg-primary transition-all cursor-pointer" type="checkbox" />
                    <span className="material-symbols-outlined absolute text-white text-[16px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">Remember me</span>
                </label>
                <a className="text-sm font-bold text-primary hover:text-primary-container transition-colors" href="#">Forgot Password?</a>
              </div>
              <button className="w-full h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-bold rounded-DEFAULT shadow-[0px_10px_20px_rgba(83,65,205,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group" type="submit">
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </form>
            <footer className="mt-12 text-center">
              <p className="text-on-surface-variant font-medium">
                Don't have an account?
                <a className="text-on-surface font-bold hover:text-primary transition-colors ml-1" href="#">Sign up</a>
              </p>
            </footer>
            <div className="mt-10 pt-10 border-t-0 flex flex-col items-center gap-6">
              <div className="relative w-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant opacity-20"></div></div>
                <span className="relative bg-surface-container-lowest px-4 text-[10px] uppercase tracking-widest text-outline font-bold">Or continue with</span>
              </div>
              <div className="flex gap-4 w-full">
                <button className="flex-1 h-12 bg-surface-container-low rounded-DEFAULT flex items-center justify-center hover:bg-surface-container-high transition-colors">
                  <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5tVRLWf02r7V6qPWGegqk22D42ZPLkk5j7frKzZ9d9ZGfZI-OfAhqae500gZFEv9czQycCwpWRR1-XGOeZu0ri7hQnWBigC7nS07Vd0xPvnJCN3mpW6PfqLvVdNtjfq1X7ND4SAOeLPczgOqhsU546mKs9rJPoigYQ-LDQuggKlxVZZyMgMhVE8IFDaRd-EV_F7Qo6mmFQYyikkS3WrPuy-WeMHdogFxlNlVxWnnZ_NLfcTpD6NkfyqI3z833sllBPlj4_2yUy7c" />
                </button>
                <button className="flex-1 h-12 bg-surface-container-low rounded-DEFAULT flex items-center justify-center hover:bg-surface-container-high transition-colors">
                  <img alt="Apple" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQEgmc93TN7_UqiCFm9tjlS6onHUjUUb7WzJPufl2Y4bAzSMci8rAYwKl5LjtBmHfYy-nUhkXfMIBUyQEIHStVqXZQT0ftO5svsOLRrSumk1akESF4b8IB9ewOPw2mqj4L5h9lzN8R3D51fisyfpZMTSNmsxLMNNFrADjIP8UTfBW93t4B2lYQWVy_afBxjuEOV9ckl6JXlMXVtlRx9gESq3EK1qKd8pfQ5tBPSCbDXiZ74czcx9GbZO7mZzPgqD0HjMplkwhqdiA" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-8 left-8 hidden lg:flex items-center gap-3 p-3 bg-surface-container-lowest/80 backdrop-blur-xl rounded-full shadow-[0px_20px_40px_rgba(18,28,42,0.06)] border border-white/40">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.05em] font-bold text-on-surface-variant pr-2">Secure Cloud Infrastructure</span>
      </div>
    </body>
  );
}
