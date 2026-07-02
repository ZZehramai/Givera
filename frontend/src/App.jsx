import "./App.css";

function App() {
  return (
    <>
      <header>
        <nav className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto h-20">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <span className="text-headline-md font-headline-md font-bold text-primary">
                Givera
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 font-body-md text-body-md">
              <a
                className="text-primary font-bold border-b-2 border-primary pb-1 transition-colors duration-200"
                href="#"
              >
                Browse Campaigns
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors duration-200"
                href="#"
              >
                How it Works
              </a>
              <a
                className="text-on-surface-variant hover:text-primary transition-colors duration-200"
                href="#"
              >
                AI Assistant
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-primary font-label-md text-label-md px-6 py-2 hover:bg-surface-container-low rounded-lg transition-all">
              Login
            </button>
            <button className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all">
              Start a Campaign
            </button>
          </div>
        </nav>
      </header>
      <main className="pt-20">
        <section className="hero-mesh relative overflow-hidden py-24 md:py-32">
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container mb-6 animate-fade-in">
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
                <span className="font-label-md text-label-md uppercase tracking-wider">
                  Blockchain-Verified Giving
                </span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface mb-6 leading-tight">
                Empower Change through{" "}
                <span className="text-primary">Transparent</span> Giving
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-xl">
                Connect directly with causes that matter. Our AI-driven platform
                ensures every contribution is tracked, reported, and maximized
                for impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-primary text-on-primary font-label-md text-label-md px-10 py-4 rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                  Start a Campaign{" "}
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-10 py-4 rounded-xl hover:bg-secondary-fixed transition-all flex items-center justify-center gap-2">
                  Explore Causes{" "}
                  <span className="material-symbols-outlined">search</span>
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <img
                  className="w-full aspect-[4/3] object-cover"
                  data-alt="A warm, high-quality photograph of diverse community members working together in a bright, modern light-mode environment. The lighting is soft and natural, emphasizing a sense of hope and progress. The color palette features soft purples and warm ambers, reflecting the Givera brand identity. The focus is on a collaborative moment where people are looking at a digital tablet showing positive impact data."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUPHhqpXp19wd_NLe8VDSjbdp45RMok3NT7sKOS6cQ_1VtWG15tDg8qbsMo-DHkZRHGWUTAG8ugITXNC38EOcIz001Oqy7RgRj8NYb81zrGUvfq791nFxJ-hyEU5JhHH9VCeIWrEscn1m8lvQ8sVJDxYYv6pxlP_kBt_SCjpu3kqV1My71glfyJxBdLCivVNJD3yUQNUeckQ8uxP2OVpNrgIfzhexZaL1U03mYIic1ZBO1Sc2XWmpyVs5JIRjwGXmVmKVjg3jWKQwQ"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur p-4 rounded-2xl shadow-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-label-md text-label-md text-primary">
                      Live Impact
                    </span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">
                      Update 2m ago
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full progress-gradient w-[84%]"></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-on-surface font-bold">$1.2M Raised</span>
                    <span className="text-on-surface-variant">8,240 Backers</span>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-fixed-dim/30 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary-fixed-dim/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
                  Featured Campaigns
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Vetted initiatives making a real difference today.
                </p>
              </div>
              <button className="hidden md:flex items-center gap-2 text-primary font-label-md text-label-md hover:underline">
                View All Campaigns{" "}
                <span className="material-symbols-outlined">trending_flat</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow group cursor-pointer transition-all hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="A bright and optimistic classNameroom scene in a developing community, featuring modern educational tools and smiling students. The room is filled with soft, natural light and features subtle hints of the Givera purple branding in the decor. Professional architectural photography style with clean lines and a sense of progress."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAESv_0p0u8PFLQvOlrZIeUdS-EFuJRpXGLc1OOcJoboe7jaB9j8DyEl9b_CLYGQaGG_cRgMTJQvhYEejIiVwZZsOR50D89RT8k1VclmeXDtdNCIBVWhq9-dV2AcFU4kQMUJpdcZULTWj1gwZ0enF5qC495m2Q5V1jTtoMYLcJHNmdSsmJnm2XP-1K2TsWuRII6GQMK10K4VU9KuW3S6MoX10ggUF2MK-cXfI0SOfdwURnWkSffY9NWHzbP86NQOuQHBzf0zpdneyVy"
                  />
                  <div className="absolute top-4 left-4 bg-primary/90 text-on-primary px-3 py-1 rounded-full text-label-sm font-label-sm">
                    Education
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                    Empowering Tech in Rural Schools
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">
                    Providing tablets and high-speed internet to 50 schools in
                    remote villages to bridge the digital divide.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-primary font-bold text-headline-md">
                        $45,200
                      </span>
                      <span className="text-on-surface-variant font-label-md text-label-md">
                        Goal: $60,000
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full progress-gradient w-[75%] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
                      <span>75% Funded</span>
                      <span>12 Days Left</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow group cursor-pointer transition-all hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="Humanitarian aid delivery in a coastal region after a storm. High-contrast, emotive photography showing organized relief efforts with a soft-minimalist aesthetic. Professional clean composition with focus on the efficient distribution of clean water and medical supplies, using a palette of soft whites, cool blues, and Givera purples."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4kGvgPRYfMiiZl2Ys8V-FIzw1N4pN8yTjjw3XvMGihB6n1nughd9v0bQO_He5gDJze-0VgTglRlkyhdfEqXYssmMoub509-Oehi_E1ouFuef6HZ-AZqCFKyXXsAh0pvbPcJuYKCVdz9lOHsrSzWgYZvtA4nXlkdTG1nW6RYyk40e586-DlmfR3FmjPW4qTYXk_T-d9Wi2uzvGglARApAoHJZxshe33Esevsmjbn1ELwql5H7dXV-kSPhbUehwDoV2sYCUsTNr1P_e"
                  />
                  <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary px-3 py-1 rounded-full text-label-sm font-label-sm">
                    Disaster Relief
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                    Coastal Flood Relief Operations
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">
                    Emergency aid deployment for communities affected by the
                    recent hurricane season surge.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-primary font-bold text-headline-md">
                        $112,000
                      </span>
                      <span className="text-on-surface-variant font-label-md text-label-md">
                        Goal: $150,000
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full progress-gradient w-[78%] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
                      <span>78% Funded</span>
                      <span>3 Days Left</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow group cursor-pointer transition-all hover:-translate-y-2">
                <div className="relative h-56 overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    data-alt="A modern medical lab facility with advanced diagnostic equipment. The scene is bright and clinical but with a welcoming, human-centric design. Soft lighting highlights the precision of the technology while maintaining an optimistic, supportive atmosphere. Dominant white and light gray tones with primary purple accents from Givera's palette."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBko5Avf6QOGtkQ4pTlcatSE89FyZex0Qrf2ROaYLp3UFXGXgGB8KaLbBULLNMRoUSjFVDdzbEoKYzA2M0Wm1UHqJve99RKXr5tGtXDpQW0asgKKIiN4bpZiZ-MDz0T5sH122KGHVovYyK24KjYIM4QE5N0X41UfMn4xhhn8wahzT9DnBGJ9RL0uEP6pFV9nNDG4nyW7w9RsJCjnQ5kO6Uw_dtggOfeyU8-xfs1fyB8RD_sS0hHishH9RsEoVnbebk140HSaVrXS-Ef"
                  />
                  <div className="absolute top-4 left-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-label-sm">
                    Medical
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-3">
                    Cancer Research Accelerator
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6 line-clamp-2">
                    Funding the final stage of clinical trials for a
                    non-invasive pediatric screening technology.
                  </p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-primary font-bold text-headline-md">
                        $28,900
                      </span>
                      <span className="text-on-surface-variant font-label-md text-label-md">
                        Goal: $100,000
                      </span>
                    </div>
                    <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div className="h-full progress-gradient w-[29%] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant">
                      <span>29% Funded</span>
                      <span>45 Days Left</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-container-low relative overflow-hidden">
          <div className="max-w-container-max mx-auto px-margin-desktop grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-surface rounded-2xl p-8 ambient-shadow border-l-4 border-primary">
                  <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center mb-6 text-on-primary-container">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-3">
                    Campaign Writer
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Our AI helps you craft compelling, emotionally resonant
                    stories that drive donations in seconds.
                  </p>
                </div>
                <div className="bg-surface rounded-2xl p-8 ambient-shadow border-l-4 border-secondary">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center mb-6 text-on-secondary-container">
                    <span className="material-symbols-outlined">forum</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-3">
                    Smart Chatbot
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Instant answers for donors about fund utilization and impact
                    metrics, 24/7.
                  </p>
                </div>
                <div className="bg-surface rounded-2xl p-8 ambient-shadow border-l-4 border-tertiary">
                  <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center mb-6 text-on-tertiary">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-3">
                    Donor Insights
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    AI-powered analytics predict giving patterns and help
                    optimize your fundraising strategy.
                  </p>
                </div>
                <div className="bg-surface rounded-2xl p-8 ambient-shadow border-l-4 border-outline-variant">
                  <div className="w-12 h-12 bg-surface-variant rounded-xl flex items-center justify-center mb-6 text-on-surface-variant">
                    <span className="material-symbols-outlined">language</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-3">
                    Global Outreach
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Automatically translate and localize your campaign for a
                    worldwide audience.
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-6">
                AI That Empowers <span className="text-primary italic">Human</span>{" "}
                Connection
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
                We use artificial intelligence not to replace empathy, but to
                amplify it. Our suite of smart tools removes the administrative
                burden of fundraising so you can focus on what matters: the
                mission.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">
                    check_circle
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md">
                      Optimized Content
                    </h4>
                    <p className="text-on-surface-variant">
                      Higher conversion rates through data-backed storytelling.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary mt-1">
                    check_circle
                  </span>
                  <div>
                    <h4 className="font-label-md text-label-md">
                      Real-time Translation
                    </h4>
                    <p className="text-on-surface-variant">
                      Reach donors in over 40 languages instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">
                Radical Transparency as Standard
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Trust is the currency of change. We provide deep-level insights
                into exactly how every dollar is utilized.
              </p>
            </div>
            <div className="bg-surface-container rounded-[2rem] p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1 space-y-8">
                <div>
                  <h3 className="font-headline-md text-headline-md text-primary mb-4">
                    Fund Utilization Reports
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Every campaign generates an automated ledger-backed report.
                    Donors can see real-time updates on procurement, logistics,
                    and final delivery of aid.
                  </p>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        account_balance_wallet
                      </span>
                    </div>
                    <span className="font-body-md">
                      Direct bank-to-aid tracking
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        assignment_turned_in
                      </span>
                    </div>
                    <span className="font-body-md">
                      Photo Video verification of impact
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        verified_user
                      </span>
                    </div>
                    <span className="font-body-md">
                      Third-party audit certification
                    </span>
                  </li>
                </ul>
                <button className="bg-surface text-primary border border-primary/20 font-label-md text-label-md px-8 py-4 rounded-xl hover:bg-primary-fixed transition-all">
                  Download Sample Report
                </button>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 border border-outline-variant/30">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container"></div>
                      <div>
                        <div className="text-label-md font-label-md">
                          Education Fund #402
                        </div>
                        <div className="text-label-sm text-on-surface-variant">
                          Weekly Report
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      more_vert
                    </span>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-label-sm uppercase text-on-surface-variant tracking-wider mb-1">
                          Total Allocated
                        </div>
                        <div className="text-headline-md font-bold text-primary">
                          $45,200.00
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-label-sm uppercase text-on-surface-variant tracking-wider mb-1">
                          Utilized
                        </div>
                        <div className="text-headline-md font-bold text-on-surface">
                          82%
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="h-16 bg-primary/80 rounded-lg"></div>
                      <div className="h-16 bg-primary/60 rounded-lg"></div>
                      <div className="h-16 bg-primary/40 rounded-lg"></div>
                      <div className="h-16 bg-surface-container-low rounded-lg"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg">
                        <span className="text-label-md">
                          Solar Panel Installation
                        </span>
                        <span className="font-bold text-primary">$12,400</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-lg">
                        <span className="text-label-md">classNameroom Equipment</span>
                        <span className="font-bold text-primary">$8,200</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="text-center mb-16">
              <h2 className="font-label-md text-label-md uppercase tracking-[0.2em] text-on-surface-variant mb-4">
                Trusted by Leading Organizations
              </h2>
              <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 font-headline-md font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px]">eco</span>{" "}
                  GLOBAL AID
                </div>
                <div className="flex items-center gap-2 font-headline-md font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px]">
                    health_and_safety
                  </span>{" "}
                  HEALTH CORE
                </div>
                <div className="flex items-center gap-2 font-headline-md font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px]">
                    public
                  </span>{" "}
                  EARTH FIRST
                </div>
                <div className="flex items-center gap-2 font-headline-md font-bold text-on-surface-variant">
                  <span className="material-symbols-outlined text-[32px]">
                    school
                  </span>{" "}
                  EDU REACH
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-20">
              <div className="p-10 rounded-[2.5rem] bg-secondary-container relative overflow-hidden">
                <span className="material-symbols-outlined text-on-secondary-container/20 text-[120px] absolute -top-4 -right-4">
                  format_quote
                </span>
                <p className="font-headline-md text-headline-md text-on-secondary-container mb-8 relative z-10">
                  "Givera transformed our disaster response. The transparency
                  tools alone increased our recurring donor base by 40% in just
                  six months."
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white overflow-hidden border-2 border-white shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Professional portrait of a middle-aged woman with a warm, confident expression. She is in a bright, modern office setting. The style is clean and high-end, reflecting leadership and empathy in the non-profit sector. Soft lighting and a focus on natural, approachable features."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0PobBBZO8EsA_9FrczKKBIJQo-_K4XK1p3Jt43KpH_5BsUZswfRigd4hIdo4I-wau60iS-bF6ZxZhf4Uehe1aweXe7LYLV_DFRfPj6PsRuJ4IlseAQpLqEB7bhChU5cFJnYCYMEyLJZBv6CIurPJJ3eUgT6i2BtHAHpLBYKXA-89cH1xIl-FyxtEEF7dr0zByN1FoMV3qEZB7d7oPjrUO47hmDEvPROEUFvvdMrqzcDBrHtG0gykXTktl6JpJYadxG1J_bHF6nZfI"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-on-secondary-container">
                      Sarah Jenkins
                    </div>
                    <div className="text-label-sm text-on-secondary-fixed-variant">
                      Director, Coastal Relief NGO
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-10 rounded-[2.5rem] bg-primary-fixed relative overflow-hidden">
                <span className="material-symbols-outlined text-on-primary-fixed/10 text-[120px] absolute -top-4 -right-4">
                  format_quote
                </span>
                <p className="font-headline-md text-headline-md text-on-primary-fixed mb-8 relative z-10">
                  "Seeing exactly where my money goes makes giving feel so much
                  more meaningful. The AI reports are incredible and easy to
                  understand."
                </p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-white overflow-hidden border-2 border-white shadow-md">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="Close-up portrait of a young professional man looking thoughtfully into the camera. Modern urban loft background with soft bokeh. The lighting is sophisticated and warm. High-end photography style emphasizing trust, authenticity, and a contemporary lifestyle."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAkF_UU5Kqlea_IPnW-3ArYnXc0jezuyN65xUTtvl9oFojZALUfga7M_vR7Ju8cq7oChAcu3pW98XAzhCdOMm7dMYweE84STBNumHtM5FMa1O1jurT_OPFlLVUeOjsnP0qqMKnEK8Rba9FYhjHegwZDh4zRaFOixw5MEoD4uJaVfSIJDQgOJzZx_MGKecJpCGsZkornfTK5NQkuZs0zgFw1jaFXDA_zAff_-glQE2CSrrDk4xLK4A3S2aEuGFvZ6V1my-afqimLuj3"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-on-primary-fixed">
                      David Chen
                    </div>
                    <div className="text-label-sm text-on-primary-fixed-variant">
                      Individual Donor since 2022
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-surface">
          <div className="max-w-container-max mx-auto px-margin-desktop">
            <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-on-primary relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
              <h2 className="font-headline-xl text-headline-xl mb-6 relative z-10">
                Ready to make a difference?
              </h2>
              <p className="font-body-lg text-body-lg mb-12 max-w-2xl mx-auto opacity-90 relative z-10">
                Join 50,000+ donors and 1,200 organizations building a more
                transparent future for global philanthropy.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                <button className="bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md px-12 py-5 rounded-2xl shadow-xl hover:bg-secondary-container transition-all active:scale-95">
                  Start a Campaign
                </button>
                <button className="bg-transparent border border-on-primary/30 text-on-primary font-label-md text-label-md px-12 py-5 rounded-2xl hover:bg-on-primary/10 transition-all">
                  Explore Causes
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-surface-container-low dark:bg-inverse-surface">
          <div className="w-full py-16 px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-gutter">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img
                  alt="Givera Logo"
                  className="h-8 w-auto"
                  src="data:image/png;base64,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"
                />
                <span className="text-headline-md font-headline-md text-primary">
                  Givera
                </span>
              </div>
              <p className="text-on-surface-variant font-body-md mb-6">
                Making the world's giving more transparent, efficient, and
                impactful through the power of AI.
              </p>
              <div className="flex gap-4">
                <a
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:text-primary transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined">public</span>
                </a>
                <a
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center hover:text-primary transition-all"
                  href="#"
                >
                  <span className="material-symbols-outlined">mail</span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-widest">
                Platform
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Browse Campaigns
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Transparency Reports
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    AI Assistant
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-widest">
                Company
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-surface mb-6 uppercase tracking-widest">
                Support
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    className="text-on-surface-variant hover:text-primary underline transition-all duration-200"
                    href="#"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="max-w-container-max mx-auto px-margin-desktop py-8 border-t border-outline-variant/30 text-center md:text-left">
            <p className="text-on-surface-variant text-label-sm font-label-sm">
              © 2024 Givera. All rights reserved. Built with empathy and AI.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}

export default App;
