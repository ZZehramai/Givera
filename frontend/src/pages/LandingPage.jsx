import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ClipboardCheck,
  Eye,
  FileText,
  Heart,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";

import api from "../api/axios";
import communityHeroImage from "../assets/community-hero.jpg";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";

const currentYear = new Date().getFullYear();

const steps = [
  { icon: FileText, title: "Tell the story", text: "Share the need, the people behind it, and what success looks like." },
  { icon: ClipboardCheck, title: "Get reviewed", text: "Givera checks each submission before it becomes visible to donors." },
  { icon: Users, title: "Grow together", text: "Share your campaign and keep your community close to the progress." },
];

const trustItems = [
  { icon: ShieldCheck, title: "Reviewed", text: "Campaigns checked before publishing" },
  { icon: BarChart3, title: "Transparent", text: "Goals and progress stay visible" },
  { icon: Megaphone, title: "Connected", text: "Updates keep supporters in the story" },
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
        <section className="hero-mesh overflow-hidden px-6 pb-20 pt-16 md:pt-20">
          <div className="mx-auto max-w-container-max lg:grid lg:grid-cols-[0.92fr_1.08fr] lg:items-end lg:gap-16">
            <motion.div
              className="lg:pb-6 lg:text-left"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.01em] text-primary shadow-sm backdrop-blur">
              <Heart size={16} strokeWidth={2.5} aria-hidden="true" />
              A kinder way to fund change
            </div>
            <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-extrabold leading-[1.03] md:text-7xl lg:mx-0">
              Good things happen when <span className="text-primary">people show up.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant lg:mx-0">
              Discover thoughtful campaigns, support the stories that move you, and see
              the difference your community makes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link to="/campaigns" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5">
                Find a cause <ArrowRight size={18} aria-hidden="true" />
              </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link to="/campaigns/create" className="inline-flex items-center justify-center gap-2 rounded-full border border-outline-variant bg-white px-7 py-4 font-bold text-primary transition hover:border-primary/30">
                Start a campaign <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              </motion.div>
            </div>
            </motion.div>

          <motion.div
            className="relative mx-auto mt-14 max-w-5xl lg:mt-0"
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
          >
            <div className="overflow-hidden rounded-[2.25rem] border-[8px] border-white bg-white shadow-2xl">
              <img src={communityHeroImage} alt="Volunteers working together to distribute food boxes" className="aspect-[16/8] w-full object-cover" />
            </div>
            <div className="absolute -bottom-8 left-4 rounded-2xl bg-white p-4 shadow-xl sm:left-10 sm:flex sm:items-center sm:gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-tertiary-container text-tertiary"><ShieldCheck size={22} aria-hidden="true" /></span>
              <div className="mt-2 sm:mt-0"><p className="font-bold">Reviewed with care</p><p className="text-sm text-on-surface-variant">Trust starts before giving.</p></div>
            </div>
            <div className="absolute -right-2 -top-7 hidden rounded-2xl bg-secondary-container p-4 shadow-xl sm:block sm:right-8">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Community powered</p>
              <p className="mt-1 text-sm text-on-secondary-fixed-variant">Every gift moves the story.</p>
            </div>
          </motion.div>
          </div>
        </section>

        <section className="bg-white px-6 pb-16 pt-20">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
            {trustItems.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                className="flex gap-4 rounded-2xl border border-outline-variant/60 p-5 transition-shadow hover:shadow-md"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Icon className="shrink-0 text-primary" size={24} aria-hidden="true" />
                <div><p className="font-bold">{title}</p><p className="mt-1 text-sm leading-6 text-on-surface-variant">{text}</p></div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="campaigns" className="scroll-mt-28 bg-surface-container-low py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="w-full">
                <p className="text-sm font-bold uppercase text-primary text-center">Open your heart</p>
                <h2 className="mt-2 text-center text-4xl font-extrabold md:text-5xl">Stories seeking support</h2>
                <p className="mt-3 text-on-surface-variant text-center">Recently approved campaigns from people in the Givera community.</p>
              </div>
              <Link to="/campaigns" className="ml-auto inline-flex self-start items-center gap-2 rounded-full px-5 py-3 font-bold text-on-surface-variant hover:text-primary text-sm transition ">
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

        <section id="how-it-works" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Your journey</p>
                <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">A simple path from idea to impact</h2>
                <p className="mt-4 leading-7 text-on-surface-variant">No maze of steps. Just a clear way to share, review, and grow a cause.</p>
                <Link to="/register" className="mt-7 inline-flex items-center gap-2 font-bold text-primary hover:underline">Create an account <ArrowRight size={18} aria-hidden="true" /></Link>
              </div>
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                  <motion.article key={step.title} className="grid gap-4 rounded-3xl border border-outline-variant/60 bg-surface p-6 sm:grid-cols-[auto_1fr_auto] sm:items-center" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45, delay: index * 0.1 }}>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-fixed text-primary"><StepIcon size={23} aria-hidden="true" /></span>
                    <div><p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Step {index + 1}</p><h3 className="mt-1 text-xl font-bold">{step.title}</h3><p className="mt-2 leading-7 text-on-surface-variant">{step.text}</p></div>
                    <ArrowRight className="hidden text-outline-variant sm:block" size={20} aria-hidden="true" />
                  </motion.article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-20">
          <div className="mx-auto grid max-w-container-max gap-6 px-6 lg:grid-cols-2">
            <motion.article className="min-h-80 rounded-[2rem] bg-primary p-8 text-white md:p-10" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55 }}>
              <span className="inline-grid rounded-2xl bg-white/15 p-3"><Eye size={28} aria-hidden="true" /></span>
              <h2 className="mt-14 max-w-md text-3xl font-extrabold">Transparency that feels reassuring, not complicated.</h2>
              <p className="mt-4 max-w-md leading-7 text-primary-fixed">Campaign stories, goals, deadlines, and review status stay easy to understand.</p>
            </motion.article>
            <motion.article className="min-h-80 rounded-[2rem] bg-secondary-container p-8 md:p-10" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, delay: 0.12 }}>
              <span className="inline-grid rounded-2xl bg-white/60 p-3 text-secondary"><Users size={28} aria-hidden="true" /></span>
              <h2 className="mt-14 max-w-md text-3xl font-extrabold">Designed around people, not transactions.</h2>
              <p className="mt-4 max-w-md leading-7 text-on-secondary-fixed-variant">Human stories and ongoing updates keep generosity connected to real progress.</p>
            </motion.article>
          </div>
        </section>

        <section id="faq" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto grid max-w-5xl gap-10 px-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Good to know</p><h2 className="mt-2 text-3xl font-extrabold">Your questions, answered.</h2></div>
            <div className="space-y-3">{faqs.map(([question, answer]) => (
              <motion.details key={question} className="group rounded-2xl border border-outline-variant/60 bg-surface p-5" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.4 }}>
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-bold">{question}<ChevronDown className="shrink-0 transition group-open:rotate-180" size={20} aria-hidden="true" /></summary>
                <p className="mt-3 leading-7 text-on-surface-variant">{answer}</p>
              </motion.details>
            ))}</div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <motion.div className="mx-auto max-w-container-max overflow-hidden rounded-[2.5rem] bg-[#29233E] px-6 py-16 text-center text-white md:px-12" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.6 }}>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-fixed">Make today matter</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold md:text-5xl">A cause is waiting for someone like you.</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/65">Support a story or invite your community into one of your own.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/campaigns" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-bold text-on-surface">Explore causes <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link to="/campaigns/create" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-4 font-bold text-white">Start a campaign <ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </motion.div>
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
