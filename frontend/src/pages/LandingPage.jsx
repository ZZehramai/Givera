import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  Gift,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import api from "../api/axios";
import communityHeroImage from "../assets/community-hero.jpg";
import image from "../assets/image.jpg";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.avif";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";
import { useLanguage } from "../i18n/LanguageContext";

const currentYear = new Date().getFullYear();

const donorJourneySteps = [
  { icon: Heart, titleKey: "discoverCause", textKey: "discoverCauseText", x: 16.7, y: 58 },
  { icon: Gift, titleKey: "giveSeconds", textKey: "giveSecondsText", x: 50, y: 30 },
  { icon: BarChart3, titleKey: "followImpact", textKey: "followImpactText", x: 83.3, y: 34 },
];

const trustItems = [
  {
    icon: ShieldCheck,
    titleKey: "reviewedCampaigns",
    textKey: "reviewedCampaignsText",
  },
  {
    icon: BarChart3,
    titleKey: "visibleFundUse",
    textKey: "visibleFundUseText",
  },
  {
    icon: Check,
    titleKey: "clearRecords",
    textKey: "clearRecordsText",
  },
];

const faqKeys = [1, 2, 3, 4];

export function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const [featured, setFeatured] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/campaigns/")
      .then(({ data }) => active && setFeatured(data.slice(0, 5)))
      .catch(() => active && setFeatured([]));
    return () => { active = false; };
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setIsSubscribed(true);
    setNewsletterEmail("");

    setTimeout(() => {
      setIsSubscribed(false);
    }, 5000);
  };

  const handleLanguageSelect = (selectedLang) => {
    if (setLanguage && language !== selectedLang) {
      setLanguage(selectedLang);
    }
  };

  const mainCampaign = featured[0];
  const sideCampaigns = featured.slice(1, 5);

  return (
    <div className="min-h-screen bg-white text-on-surface">
      <AppHeader />

      <main>
        {/* HERO SECTION */}
        <section id="hero" className="relative w-full overflow-hidden bg-white px-4 pb-24 pt-16 text-center md:px-8 md:pt-24 lg:pt-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-100 px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-purple-700 shadow-md">
                <Heart size={16} strokeWidth={2.5} aria-hidden="true" />
                {t("heroBadgeLong")}
              </div>

               <h1 className="mt-7 text-4xl font-black uppercase tracking-tight text-slate-900 leading-[0.95] sm:text-6xl md:text-7xl xl:text-6xl">
                {t("heroHeadline")} <br />
                <span className="text-primary">{t("byGiving")}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-on-surface-variant md:text-xl">
                {t("heroDescription")}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/campaigns" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-9 py-4 font-bold text-white shadow-xl shadow-primary/25 transition hover:-translate-y-0.5">
                    {t("startBrowsing")} <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </motion.div>
              </div>
              
            </motion.div>
          </div>

          {/* POLAROID GALLERY */}
          <motion.div
            className="relative mt-16 w-full max-w-none pb-6 pt-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.15, ease: "easeOut" }}
          >
            <svg
              className="pointer-events-none absolute left-0 top-8 -z-0 hidden h-28 w-full stroke-slate-300/80 lg:block"
              viewBox="0 0 1400 120"
              fill="none"
              preserveAspectRatio="none"
            >
              <path d="M 0,20 Q 700,110 1400,20" strokeWidth="2.5" strokeDasharray="6 6" />
            </svg>

            <div className="relative z-10 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-10 px-6 pb-6 pt-10 sm:gap-x-6 lg:gap-x-8">
              {/* Card 1 */}
              <div className="relative shrink-0 w-48 sm:w-56 md:w-64 -rotate-12 transform rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl transition duration-300 hover:z-30 hover:rotate-0 hover:scale-105 lg:translate-y-8">
                <div className="absolute -top-3 left-1/2 z-20 h-4 w-4 -translate-x-1/2 rounded-full bg-emerald-500 shadow-md ring-4 ring-white" />
                <div className="overflow-hidden rounded-xl bg-slate-100">
                  <img src={image} alt="Donation impact one" className="aspect-[4/3] w-full object-cover" />
                </div>
                <div className="mt-3 text-left">
                  <p className="text-sm font-bold text-slate-900 md:text-base">{t("reviewedCare")}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t("reviewedCareText")}</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="relative shrink-0 w-48 sm:w-56 md:w-64 -rotate-6 transform rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl transition duration-300 hover:z-30 hover:rotate-0 hover:scale-105 lg:translate-y-3">
                <div className="absolute -top-3 left-1/2 z-20 h-4 w-4 -translate-x-1/2 rounded-full bg-emerald-500 shadow-md ring-4 ring-white" />
                <div className="overflow-hidden rounded-xl bg-slate-100">
                  <img src={communityHeroImage} alt="Donation impact two" className="aspect-[4/3] w-full object-cover filter brightness-95" />
                </div>
                <div className="mt-3 text-left">
                  <p className="text-sm font-bold text-slate-900 md:text-base">{t("communityPowered")}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t("communityPoweredText")}</p>
                </div>
              </div>

              {/* Card 3 (Center Highlight) */}
              <div className="relative z-20 shrink-0 w-56 sm:w-64 md:w-72 rotate-0 transform rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl transition duration-300 hover:scale-110 lg:-translate-y-4 lg:scale-105">
                <div className="absolute -top-3 left-1/2 z-20 h-4.5 w-4.5 -translate-x-1/2 rounded-full bg-emerald-500 shadow-md ring-4 ring-white" />
                <div className="overflow-hidden rounded-xl bg-slate-100">
                  <img src={image1} alt="Donation impact three" className="aspect-[16/11] w-full object-cover" />
                </div>
                <div className="mt-3.5 text-left">
                  <p className="text-base font-bold text-slate-900 md:text-lg">{t("reviewedCare")}</p>
                  <p className="mt-0.5 text-xs text-slate-500 md:text-sm">{t("reviewedCareText")}</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="relative shrink-0 w-48 sm:w-56 md:w-64 rotate-6 transform rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xl transition duration-300 hover:z-30 hover:rotate-0 hover:scale-105 lg:translate-y-3">
                <div className="absolute -top-3 left-1/2 z-20 h-4 w-4 -translate-x-1/2 rounded-full bg-emerald-500 shadow-md ring-4 ring-white" />
                <div className="overflow-hidden rounded-xl bg-slate-100">
                  <img src={image2} alt="Donation impact four" className="aspect-[4/3] w-full object-cover filter contrast-105" />
                </div>
                <div className="mt-3 text-left">
                  <p className="text-sm font-bold text-slate-900 md:text-base">{t("communityPowered")}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t("communityPoweredText")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* TRANSPARENCY SECTION */}
        <section className="relative overflow-hidden rounded-t-[50%_10%] bg-gray-100 pb-28 pt-36">
          <div className="relative mx-auto max-w-container-max px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">{t("impactTitle")}</h2>
              <p className="mt-4 text-base leading-7 text-slate-700">
                {t("impactDescription")}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {trustItems.map(({ icon: Icon, titleKey, textKey }, index) => (
                <motion.div
                  key={titleKey}
                  className="rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                >
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-slate-900">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t(textKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CAMPAIGNS SECTION */}
        <section id="campaigns" className="scroll-mt-28 bg-white py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-slate-200/60 pb-8 dark:border-slate-800">
              <div className="max-w-2xl">
                <h2 className="text-5xl font-bold text-slate-900 sm:text-5xl md:text-6xl">
                   <span className="text-slate-900">{t("featuredCampaigns")}</span>
                </h2>
                
                <p className="mt-3 text-base font-medium leading-relaxed text-on-surface-variant md:text-lg">
                  {t("featuredDescription")}
                </p>
              </div>

              <Link 
                to="/campaigns" 
                className="group inline-flex items-center gap-2.5 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all duration-300 hover:border-primary hover:bg-slate-50 hover:shadow-md"
              >
                <span>{t("browseAll")}</span>
                <ArrowRight size={18} className="text-primary transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>

            {featured.length ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {mainCampaign && (
                  <div className="lg:col-span-6 flex flex-col">
                    <CampaignCard campaign={mainCampaign} isFeatured={true} />
                  </div>
                )}

                <div className="lg:col-span-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {sideCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-10 rounded-[2rem] border border-outline-variant/50 bg-white px-6 py-14 text-center">
                <span className="inline-grid rounded-full bg-primary-fixed p-4 text-primary"><Heart size={32} aria-hidden="true" /></span>
                <h3 className="mt-5 text-2xl font-bold">{t("firstStory")}</h3>
                <p className="mx-auto mt-3 max-w-lg leading-7 text-on-surface-variant">{t("firstStoryText")}</p>
                <Link to="/campaigns/create" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white">{t("createCampaign")} <ArrowUpRight size={18} aria-hidden="true" /></Link>
              </div>
            )}
          </div>
        </section>

        {/* COMMUNITY PROPOSALS SECTION */}
        <section
          id="campaign-request"
          className="rounded-b-[50%_10%] bg-purple-100 pb-28 pt-14 md:pb-36 md:pt-20"
        >
          <div className="mx-auto max-w-container-max px-6">
            <motion.div
              className="relative overflow-hidden py-8 md:py-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55 }}
            >
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div className="flex flex-col items-start">
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-purple-500">
                    <Sparkles size={14} aria-hidden="true" />
                    {t("communityProposals")}
                  </div>

                  <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                    {t("directFunding")}
                  </h2>

                  <p className="mt-3 text-base leading-relaxed text-slate-600 md:text-lg">
                    {t("proposalDescription")}
                  </p>

                  <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/campaigns/create"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6F52D9] px-7 py-4 font-bold text-white shadow-lg shadow-[#6F52D9]/25 transition hover:-translate-y-0.5 hover:bg-[#5D42C4] sm:w-auto"
                      >
                        {t("requestNow")}
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/campaigns"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white bg-white px-7 py-4 font-bold text-[#6F52D9] shadow-sm transition sm:w-auto"
                      >
                        {t("currentCampaigns")}
                      </Link>
                    </motion.div>
                  </div>
                </div>

                <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                  <div className="relative overflow-hidden rounded-[2rem] border-4 border-white bg-surface-container-low">
                    <img
                      src={communityHeroImage}
                      alt="Frontline project initiative"
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="pointer-events-none absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] bg-[#8A6C16]/15 blur-xl" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section
          id="how-it-works"
          className="relative mb-16 mt-8 flex min-h-[calc(100vh-5rem)] scroll-mt-20 items-center justify-center overflow-hidden bg-white py-24"
        >
          <div className="relative mx-auto w-full max-w-container-max px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {t("donorJourney")}
              </p>
              <h2 className="mt-1 text-3xl font-extrabold text-on-surface md:text-4xl">
                {t("threeSteps")}
              </h2>
              <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-on-surface-variant md:text-sm">
                See how easy it is to turn your generosity into real-world change.
              </p>
            </div>

            <div className="mx-auto mt-6 max-w-container-max">
              <div className="relative aspect-[1000/220] w-full">
                <svg
                  viewBox="0 0 1000 220"
                  preserveAspectRatio="none"
                  fill="none"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="journey-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>

                  <motion.path
                    d="M20,170 C90,170 110,140 150,130 C230,110 320,50 430,50 C520,50 600,110 690,110 C780,110 880,50 970,30"
                    stroke="url(#journey-gradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </svg>

                {donorJourneySteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const iconColorClass = 
                    index === 0 ? "text-purple-600 bg-purple-50" : 
                    index === 1 ? "text-pink-600 bg-pink-50" : 
                    "text-blue-600 bg-blue-50";

                  return (
                    <motion.div
                      key={step.titleKey}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${step.x}%`, top: `${step.y}%` }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.35, delay: 0.25 + index * 0.2 }}
                    >
                      <span className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-md" aria-hidden="true" />
                      <span className={`grid h-12 w-12 place-items-center rounded-xl border border-outline-variant/50 shadow-md ${iconColorClass}`}>
                        <StepIcon size={22} aria-hidden="true" />
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-3 grid gap-6 sm:grid-cols-3">
                {donorJourneySteps.map((step, index) => (
                  <motion.div
                    key={step.titleKey}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.35, delay: 0.1 + index * 0.1 }}
                  >
                    <span className="text-2xl font-extrabold text-outline-variant/70 md:text-3xl">0{index + 1}</span>
                    <h3 className="mt-0.5 text-base font-bold text-on-surface md:text-lg">{t(step.titleKey)}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-on-surface-variant md:text-sm">{t(step.textKey)}</p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="mb-16 ml-8 mr-8 p-4 scroll-mt-28 overflow-hidden bg-purple-100 pb-36 pt-24 sm:mb-20 sm:rounded-br-[10rem] sm:rounded-tl-[10rem] lg:mb-24 lg:rounded-br-[8rem] lg:rounded-tl-[8rem]">
          <div className="mx-auto max-w-container-max px-6">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
              <div className="lg:sticky lg:top-28">
                <p className="text-sm font-bold uppercase tracking-[0.11em] text-primary">{t("helpCentre")}</p>
                <h2 className="mt-4 text-5xl font-extrabold tracking-tight text-black sm:text-6xl">{t("covered")}</h2>
                <p className="mt-5 max-w-md text-base leading-7 text-black/80">
                  {t("faqIntro")}
                </p>
                <p className="mt-7 text-sm text-black/65">
                  Still have questions? <a href="#footer" className="font-bold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary">Learn more about how Givera works</a>.
                </p>
              </div>

              <div className="space-y-3">
                {faqKeys.map((faqNumber, index) => {
                  const question = t(`faqQuestion${faqNumber}`);
                  const answer = t(`faqAnswer${faqNumber}`);
                  const isOpen = openFaq === index;
                  return (
                    <motion.div 
                      key={question} 
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${isOpen ? "border-primary/25 bg-[#FBF8FF] shadow-sm" : "border-primary/10 bg-white/85 hover:border-primary/25 hover:bg-white"}`}
                    initial={{ opacity: 0, y: 12 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, amount: 0.5 }} 
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-6 text-left font-bold text-slate-900 transition-colors hover:text-primary sm:px-8"
                    >
                      <span className="text-base font-bold">{question}</span>
                      <span 
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          isOpen 
                            ? "bg-primary text-white" 
                            : "bg-white text-primary ring-1 ring-primary/20 hover:bg-primary-fixed"
                        }`}
                      >
                        {isOpen ? <Minus size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="max-w-2xl px-6 pb-6 pr-16 text-sm leading-relaxed text-slate-600 sm:px-8"
                        >
                          {answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="footer" className="mt-auto w-full border-t border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
        <div className="mx-auto max-w-container-max px-6 py-12">
          
          {/* Segmented EN / မြန်မာ Toggle Button */}
          <div className="mb-8 border-b border-slate-200/80 pb-6 dark:border-slate-800">
            <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => handleLanguageSelect("en")}
                className={`rounded-xl px-4 py-1.5 text-base font-extrabold transition-all duration-200 ${
                  language !== "my"
                    ? "bg-[#6c52ee] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSelect("my")}
                className={`rounded-xl px-4 py-1.5 text-base font-bold transition-all duration-200 ${
                  language === "my"
                    ? "bg-[#6c52ee] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                မြန်မာ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Brand & Trust */}
            <div className="flex flex-col gap-3 lg:col-span-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Donation Transparent
                </span>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Accountability, clarity, and impact in every transaction.
              </p>
              <div className="mt-2 flex items-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified Transparent</span>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Platform
              </h4>
              <nav className="flex flex-col gap-2.5 text-sm font-medium">
                <a
                  className="text-slate-700 transition-colors hover:text-primary dark:text-slate-300"
                  href="#campaigns"
                >
                  {t("campaigns")}
                </a>
                <a
                  className="text-slate-700 transition-colors hover:text-primary dark:text-slate-300"
                  href="#how-it-works"
                >
                  {t("howItWorks")}
                </a>
                <a
                  className="text-slate-700 transition-colors hover:text-primary dark:text-slate-300"
                  href="#faq"
                >
                  {t("faq")}
                </a>
                <Link
                  className="text-slate-700 transition-colors hover:text-primary dark:text-slate-300"
                  to="/profile"
                >
                  {t("profile")}
                </Link>
              </nav>
            </div>

            {/* Newsletter */}
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {t("stayInformed")}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get transparency updates and impact summaries delivered to your inbox.
              </p>
              <form
                className="mt-1 flex w-full max-w-md flex-col gap-2.5 sm:flex-row"
                onSubmit={handleSubscribe}
              >
                <input
                  className="w-full flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder={t("emailAddress")}
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  disabled={isSubscribed}
                  required
                />
                <button
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 ${
                    isSubscribed
                      ? "bg-emerald-600 hover:bg-emerald-600"
                      : "bg-primary hover:bg-primary/90 hover:shadow-lg"
                  }`}
                  type="submit"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <>
                      <Check size={16} strokeWidth={3} /> {t("subscribed")}
                    </>
                  ) : (
                    t("subscribe")
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="mt-10 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            © {currentYear} Givera. {t("rightsReserved")}
          </div>
        </div>
      </footer>
    </div>
  );
}