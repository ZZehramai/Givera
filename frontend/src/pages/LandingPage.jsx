import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Gift,
  Heart,
  Megaphone,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import api from "../api/axios";
import communityHeroImage from "../assets/community-hero.jpg";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";

const currentYear = new Date().getFullYear();


const steps = [
  { icon: Heart, title: "Discover a cause", text: "Browse reviewed campaigns and find a story that speaks to you."},
  { icon: Gift, title: "Give in seconds", text: "Pick an amount, choose a payment method, and send your support instantly."},
  { icon: BarChart3, title: "Follow the impact", text: "Get updates as your gift moves the campaign closer to its goal."},
];


// const steps = [
//   { icon: FileText, title: "Tell the story", text: "Share the need, the people behind it, and what success looks like." },
//   { icon: ClipboardCheck, title: "Get reviewed", text: "Givera checks each submission before it becomes visible to donors." },
//   { icon: Users, title: "Grow together", text: "Share your campaign and keep your community close to the progress." },
// ];

const statsItems = [
  {
    value: "$500k",
    label: "Total raised",
    text: "Direct financial support delivered to causes worldwide.",
    icon: BarChart3,
  },
  {
    value: "200",
    label: "Total campaigns",
    text: "Carefully reviewed stories making a real difference.",
    icon: Megaphone,
  },
  {
    value: "1M",
    label: "Donators",
    text: "A growing global community powering every story.",
    icon: Heart,
  },
];

const faqs = [
  ["Who can start a campaign?", "Any registered user can submit a campaign. Every submission begins in review."],
  ["When does it become public?", "A campaign appears publicly after an administrator has reviewed and approved it."],
  ["Can organizers track progress?", "Yes. My Campaigns shows draft, pending, approved, rejected, and completed statuses."],
];

export function LandingPage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let active = true;
    api.get("/campaigns/")
      .then(({ data }) => active && setFeatured(data.slice(0, 3)))
      .catch(() => active && setFeatured([]));
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppHeader />

      <main>
       {/* HERO SECTION (FULL SIZE / EDGE-TO-EDGE DISPLAY) */}
        <section id="hero" className="relative w-full overflow-hidden bg-[#FAF8F5] px-4 pb-24 pt-16 text-center md:px-8 md:pt-24 lg:pt-28">
          {/* Centered Content Container */}
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              {/* Centered Top Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm">
                <Heart size={16} strokeWidth={2.5} aria-hidden="true" />
                A kinder way to fund change
              </div>

              {/* Heavy Bold Centered Heading */}
              <h1 className="mt-7 text-3xl font-black uppercase tracking-tight text-slate-900 sm:text-6xl md:text-4xl lg:text-4xl xl:text-6xl leading-[0.95]">
                Good things happen when <span className="text-primary">people show up.</span>
              </h1>

              {/* Subtitle Paragraph */}
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-on-surface-variant md:text-xl">
                Discover thoughtful campaigns, support the stories that move you, and see
                the difference your community makes.
              </p>

              {/* Centered Action Buttons */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/campaigns" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 font-bold text-white shadow-xl shadow-primary/25 transition hover:-translate-y-0.5">
                   Start Browsing <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </motion.div>
                
              </div>
            </motion.div>
          </div>

          {/* FULL WIDTH HANGING POLAROID GALLERY */}
                    <motion.div
                      className="relative mt-16 w-full max-w-none pb-6 pt-4"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
                    >
                      {/* Full Width Curved Hanging Line Path */}
                      <svg
                        className="pointer-events-none absolute left-0 top-8 -z-0 hidden h-28 w-full stroke-slate-300/80 lg:block"
                        viewBox="0 0 1400 120"
                        fill="none"
                        preserveAspectRatio="none"
                      >
                        <path d="M 0,20 Q 700,110 1400,20" strokeWidth="2.5" strokeDasharray="6 6" />
                      </svg>
          
                      {/* Pinned Polaroid Cards spanning full screen */}
                      <div className="relative z-10 flex w-full flex-wrap items-center justify-center gap-y-10 gap-x-4 pb-6 pt-10 sm:gap-x-6 lg:gap-x-8 px-6">
                        {/* Card 1: Far Left */}
                        <div className="relative shrink-0 w-48 sm:w-56 md:w-64 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-100 transform -rotate-12 lg:translate-y-8 transition duration-300 hover:rotate-0 hover:z-30 hover:scale-105">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white shadow-md z-20" />
                          <div className="overflow-hidden rounded-xl bg-slate-100">
                            <img src={communityHeroImage} alt="Volunteers working together to distribute food boxes" className="aspect-[4/3] w-full object-cover" />
                          </div>
                          <div className="mt-3 text-left">
                            <p className="font-bold text-slate-900 text-sm md:text-base">Reviewed with care</p>
                            <p className="text-xs text-slate-500 mt-0.5">Trust starts before giving.</p>
                          </div>
                        </div>
          
                        {/* Card 2: Mid Left */}
                        <div className="relative shrink-0 w-48 sm:w-56 md:w-64 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-100 transform -rotate-6 lg:translate-y-3 transition duration-300 hover:rotate-0 hover:z-30 hover:scale-105">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white shadow-md z-20" />
                          <div className="overflow-hidden rounded-xl bg-slate-100">
                            <img src={communityHeroImage} alt="Volunteers working together to distribute food boxes" className="aspect-[4/3] w-full object-cover filter brightness-95" />
                          </div>
                          <div className="mt-3 text-left">
                            <p className="font-bold text-slate-900 text-sm md:text-base">Community powered</p>
                            <p className="text-xs text-slate-500 mt-0.5">Every gift moves the story.</p>
                          </div>
                        </div>
          
                        {/* Card 3: Main Center Highlight */}
                        <div className="relative shrink-0 w-56 sm:w-64 md:w-72 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 transform rotate-0 lg:-translate-y-4 lg:scale-105 z-20 transition duration-300 hover:scale-110">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-4.5 w-4.5 rounded-full bg-emerald-500 ring-4 ring-white shadow-md z-20" />
                          <div className="overflow-hidden rounded-xl bg-slate-100">
                            <img src={communityHeroImage} alt="Volunteers working together to distribute food boxes" className="aspect-[16/11] w-full object-cover" />
                          </div>
                          <div className="mt-3.5 text-left">
                            <p className="font-bold text-slate-900 text-base md:text-lg">Reviewed with care</p>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Trust starts before giving.</p>
                          </div>
                        </div>
          
                        {/* Card 4: Mid Right */}
                        <div className="relative shrink-0 w-48 sm:w-56 md:w-64 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-100 transform rotate-6 lg:translate-y-3 transition duration-300 hover:rotate-0 hover:z-30 hover:scale-105">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-white shadow-md z-20" />
                          <div className="overflow-hidden rounded-xl bg-slate-100">
                            <img src={communityHeroImage} alt="Volunteers working together to distribute food boxes" className="aspect-[4/3] w-full object-cover filter contrast-105" />
                          </div>
                          <div className="mt-3 text-left">
                            <p className="font-bold text-slate-900 text-sm md:text-base">Community powered</p>
                            <p className="text-xs text-slate-500 mt-0.5">Every gift moves the story.</p>
                          </div>
                        </div>
        
                      </div>
                    </motion.div>
                  </section>

        {/* REDESIGNED STATS SECTION */}
        <section className="bg-white px-6 pb-20 pt-16">
          <div className="mx-auto max-w-container-max">
            <div className="grid gap-6 sm:grid-cols-3">
              {statsItems.map(({ value, label, text, icon: Icon }, index) => (
                <motion.div
                  key={label}
                  className="group relative flex flex-col justify-between rounded-[2rem] border border-outline-variant/60 bg-surface-container-low/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white hover:shadow-xl hover:shadow-primary/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                  </div>

                  <div className="mt-8">
                    <span className="block text-4xl font-extrabold tracking-tight text-on-surface sm:text-5xl">
                      {value}
                    </span>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                      {text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


       {/* REDESIGNED: DIRECT FUNDING / COMMUNITY PROPOSALS SECTION */}
        <section
          id="campaign-request"
          className="scroll-mt-28 bg-surface-container-low py-20"
        >
          <div className="mx-auto max-w-container-max px-6">
            <motion.div
              className="mx-auto max-w-container-max px-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
            >
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                {/* LEFT COLUMN: Text & Buttons */}
                <div className="flex flex-col items-start">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary-fixed/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    <Sparkles size={14} aria-hidden="true" />
                    Start a Fundraising Campaign
                  </div>

                  <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                    Need Help? <span className="text-primary">Create a Campaign</span>
                  </h2>

                  <p className="mt-3 text-base leading-relaxed text-on-surface-variant md:text-lg">
                    If you or your community needs support, you can create a fundraising
                    campaign on Givera. Share your story, explain your needs, and let
                    generous people help make a difference.
                  </p>

                  {/* BUTTONS */}
                  <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/campaigns/create"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 sm:w-auto"
                      >
                        <PlusCircle size={18} aria-hidden="true" />
                        Create Campaign
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/campaigns"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface px-7 py-4 font-bold text-on-surface transition hover:border-primary/40 hover:text-primary sm:w-auto"
                      >
                        <Clock size={18} aria-hidden="true" />
                        View Campaigns
                      </Link>
                    </motion.div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Image */}
                <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                  <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-surface-container-low shadow-xl transition-all duration-300 hover:shadow-2xl">
                    <img
                      src={communityHeroImage}
                      alt="People helping their community"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>

                  <div className="pointer-events-none absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] bg-primary/10 blur-xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>


        {/* CAMPAIGNS SECTION */}
        <section id="campaigns" className="scroll-mt-28 bg-surface-container-low py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Open your heart</p>
                <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Stories seeking support</h2>
                <p className="mt-3 text-on-surface-variant">Recently approved campaigns from people in the Givera community.</p>
              </div>
              <Link to="/campaigns" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-primary shadow-sm transition hover:shadow-md">
                Browse all <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            {featured.length ? (
              <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    className="h-full"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-[2rem] border border-outline-variant/50 bg-white px-6 py-14 text-center">
                <span className="inline-grid rounded-full bg-primary-fixed p-4 text-primary"><Heart size={32} aria-hidden="true" /></span>
                <h3 className="mt-5 text-2xl font-bold">Be the first story</h3>
                <p className="mx-auto mt-3 max-w-lg leading-7 text-on-surface-variant">Create a campaign and invite your community to become part of something meaningful.</p>
                <Link to="/campaigns/create" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white">Create a campaign <ArrowUpRight size={18} aria-hidden="true" /></Link>
              </div>
            )}
          </div>
        </section>


        {/* HOW IT WORKS — steps read as a connected sequence */}
        <section id="how-it-works" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Your journey</p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">A simple path from idea to impact</h2>
              <p className="mt-4 leading-7 text-on-surface-variant">No maze of steps. Just a clear way to share, review, and grow a cause.</p>
            </div>

            <div className="relative mt-14 grid gap-8 md:grid-cols-3">
              {/* connecting line, desktop only */}
              <div className="pointer-events-none absolute left-0 right-0 top-6 hidden h-px bg-outline-variant/60 md:block" aria-hidden="true" />

              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.article
                    key={step.title}
                    className="relative flex flex-col items-center text-center md:items-start md:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45, delay: index * 0.12 }}
                  >
                    <span className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl bg-primary-fixed text-primary ring-8 ring-white">
                      <StepIcon size={22} aria-hidden="true" />
                    </span>
                    <p className="mt-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Step {index + 1}</p>
                    <h3 className="mt-1 text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 leading-7 text-on-surface-variant">{step.text}</p>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-12 text-center">
                <motion.div className="inline-block" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/campaigns" className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
                    Find a cause to support <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </motion.div>
            </div>
          </div>
        </section>

        

        {/* FAQ SECTION */}
        <section id="faq" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

              {/* Left Side */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center rounded-full bg-primary-fixed/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  FAQ
                </div>

                <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
                  Everything you need to know about{" "}
                  <span className="text-primary">Givera</span>
                </h2>

                <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
                  Find answers about creating campaigns, making donations, and how
                  Givera helps connect people with meaningful causes.
                </p>
              </motion.div>


              {/* Right Side */}
              <div className="space-y-4">
                {faqs.map(([question, answer], index) => (
                  <motion.details
                    key={question}
                    className="group rounded-3xl bg-surface-container-low/50 p-6 transition-all duration-300 hover:bg-surface hover:shadow-lg"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-base font-bold text-on-surface md:text-lg">
                      <span>{question}</span>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-primary transition-transform duration-300 group-open:rotate-180">
                        <ChevronDown size={18} aria-hidden="true" />
                      </span>
                    </summary>

                    <p className="mt-4 max-w-2xl leading-7 text-on-surface-variant">
                      {answer}
                    </p>
                  </motion.details>
                ))}
              </div>

            </div>
          </div>
        </section>

       
      </main>

      <footer className="border-t border-outline-variant/60 bg-white">
        <div className="mx-auto flex max-w-container-max flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div><Link to="/" className="text-2xl font-extrabold text-primary">Givera</Link><p className="mt-2 text-sm text-on-surface-variant">Fundraising made human.</p></div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-on-surface-variant"><Link to="/campaigns" className="hover:text-primary">Campaigns</Link><a href="#how-it-works" className="hover:text-primary">How it works</a><a href="#faq" className="hover:text-primary">FAQ</a><Link to="/profile" className="hover:text-primary">Profile</Link></nav>
          <p className="text-sm text-on-surface-variant">© {currentYear} Givera</p>
        </div>
      </footer>
    </div>
  );
}