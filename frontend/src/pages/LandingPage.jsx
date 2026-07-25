import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import heroImage from "../assets/hero.png";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";

const currentYear = new Date().getFullYear();

const steps = [
  {
    number: "01",
    title: "Tell your story",
    text: "Create an account and explain the need, beneficiary, goal, and how the funds will be used.",
  },
  {
    number: "02",
    title: "Pass verification",
    text: "The Givera review team checks each submission before it becomes visible to donors.",
  },
  {
    number: "03",
    title: "Build support",
    text: "Share your approved campaign and keep supporters informed as progress is made.",
  },
];

const features = [
  {
    icon: "verified_user",
    title: "Reviewed campaigns",
    text: "Only approved campaigns appear in public search and campaign listings.",
  },
  {
    icon: "monitoring",
    title: "Visible progress",
    text: "Goals, amounts raised, deadlines, and campaign status remain easy to understand.",
  },
  {
    icon: "auto_awesome",
    title: "Smarter storytelling",
    text: "AI-assisted campaign writing and recommendations are planned as the platform grows.",
  },
];

const faqs = [
  {
    question: "Who can create a campaign?",
    answer:
      "Any registered Givera user can submit a campaign. Every submission starts in pending review.",
  },
  {
    question: "When does a campaign become public?",
    answer:
      "An administrator must approve it first. Rejected submissions include feedback for the organizer.",
  },
  {
    question: "Can I track my submission?",
    answer:
      "Yes. The My Campaigns page shows pending, approved, rejected, draft, and completed statuses.",
  },
];

export function LandingPage() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get("/campaigns/")
      .then((response) => {
        if (active) {
          setFeatured(response.data.slice(0, 3));
        }
      })
      .catch(() => {
        if (active) {
          setFeatured([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <AppHeader />

      <main>
        <section className="hero-mesh relative overflow-hidden">
          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary-fixed-dim/30 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-secondary-fixed-dim/40 blur-3xl" />

          <div className="relative mx-auto grid max-w-container-max items-center gap-14 px-6 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2 text-xs font-bold uppercase tracking-widest text-on-secondary-container">
                <span className="material-symbols-outlined text-lg">favorite</span>
                Give with confidence
              </div>
              <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight md:text-6xl">
                Turn compassion into{" "}
                <span className="text-primary">measurable change.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">
                Discover reviewed fundraising campaigns or share a cause that matters.
                Givera keeps submission, review, and progress in one clear place.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/campaigns"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  Explore campaigns
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </Link>
                <Link
                  to="/campaigns/create"
                  className="inline-flex items-center justify-center rounded-xl border border-outline-variant bg-white px-7 py-4 font-bold text-primary transition hover:bg-surface-container-low"
                >
                  Start a campaign
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-on-surface-variant">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>
                  Admin-reviewed
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>
                  Clear progress
                </span>
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg text-primary">
                    check_circle
                  </span>
                  Organizer tracking
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-2xl">
                <img
                  src={heroImage}
                  alt="People working together to support a community cause"
                  className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white p-5 shadow-xl sm:-left-8">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Community first
                </p>
                <p className="mt-1 max-w-48 text-sm text-on-surface-variant">
                  Real people supporting meaningful local causes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="campaigns" className="scroll-mt-24 bg-white py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-primary">
                  Make an impact
                </p>
                <h2 className="mt-2 text-3xl font-bold md:text-4xl">Featured campaigns</h2>
                <p className="mt-3 text-on-surface-variant">
                  Recently approved causes from the Givera community.
                </p>
              </div>
              <Link to="/campaigns" className="font-bold text-primary hover:underline">
                Browse all campaigns →
              </Link>
            </div>

            {featured.length ? (
              <div className="mt-10 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {featured.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-3xl bg-surface-container-low px-6 py-14 text-center">
                <h3 className="text-2xl font-bold">The first campaigns are on their way</h3>
                <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
                  Submit a cause for review or visit the campaign browser to see newly
                  approved campaigns.
                </p>
                <Link
                  to="/campaigns/create"
                  className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-white"
                >
                  Submit the first campaign
                </Link>
              </div>
            )}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 bg-surface-container-low py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Simple by design
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">How Givera works</h2>
              <p className="mt-3 text-on-surface-variant">
                A straightforward path from an important idea to a reviewed public campaign.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <article key={step.number} className="rounded-3xl bg-white p-7 shadow-sm">
                  <span className="text-sm font-black tracking-widest text-primary">
                    {step.number}
                  </span>
                  <h3 className="mt-6 text-2xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-on-surface-variant">{step.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/register" className="font-bold text-primary hover:underline">
                Create your Givera account →
              </Link>
            </div>
          </div>
        </section>

        <section id="transparency" className="scroll-mt-24 bg-white py-20">
          <div className="mx-auto grid max-w-container-max gap-12 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="rounded-[2rem] bg-primary p-8 text-white md:p-10">
              <span className="material-symbols-outlined text-5xl">shield_with_heart</span>
              <p className="mt-8 text-5xl font-black">100%</p>
              <p className="mt-2 text-lg text-primary-fixed">
                of public campaigns have passed an administrative review.
              </p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Built around trust
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Transparency begins before fundraising starts
              </h2>
              <p className="mt-5 text-lg leading-8 text-on-surface-variant">
                Campaigns do not immediately appear in public. Organizers provide a full
                story, beneficiary, location, goal, cover image, and deadline. An
                administrator can approve the request or return clear rejection feedback.
              </p>
              <Link
                to="/campaigns"
                className="mt-7 inline-flex items-center gap-2 font-bold text-primary hover:underline"
              >
                View approved campaigns
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="ai" className="scroll-mt-24 bg-surface-container-low py-20">
          <div className="mx-auto max-w-container-max px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Platform capabilities
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                A better foundation for generous communities
              </h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-3xl border border-outline-variant/30 bg-white p-7"
                >
                  <span className="material-symbols-outlined rounded-xl bg-secondary-container p-3 text-3xl text-primary">
                    {feature.icon}
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-on-surface-variant">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 bg-white py-20">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">
                Common questions
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
            </div>
            <div className="mt-10 space-y-4">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-outline-variant/40 bg-surface p-6"
                >
                  <summary className="cursor-pointer list-none font-bold">
                    <span className="flex items-center justify-between gap-4">
                      {item.question}
                      <span className="material-symbols-outlined transition group-open:rotate-180">
                        expand_more
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 leading-7 text-on-surface-variant">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold">Ready to move a cause forward?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-fixed">
              Explore approved campaigns or sign in to submit your own story for review.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/campaigns"
                className="rounded-xl bg-white px-7 py-4 font-bold text-primary"
              >
                Browse campaigns
              </Link>
              <Link
                to="/campaigns/create"
                className="rounded-xl border border-white/40 px-7 py-4 font-bold text-white hover:bg-white/10"
              >
                Start a campaign
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="scroll-mt-24 bg-surface-container-low">
        <div className="mx-auto grid max-w-container-max gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link to="/" className="text-2xl font-bold text-primary">
              Givera
            </Link>
            <p className="mt-4 max-w-md leading-7 text-on-surface-variant">
              A transparent home for reviewed fundraising campaigns and the communities
              that support them.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Platform</h3>
            <nav className="mt-5 flex flex-col items-start gap-3">
              <Link to="/campaigns" className="text-on-surface-variant hover:text-primary">
                Browse campaigns
              </Link>
              <Link
                to="/campaigns/create"
                className="text-on-surface-variant hover:text-primary"
              >
                Start a campaign
              </Link>
              <Link to="/my-campaigns" className="text-on-surface-variant hover:text-primary">
                My campaigns
              </Link>
              <Link to="/profile" className="text-on-surface-variant hover:text-primary">
                My profile
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest">Learn more</h3>
            <nav className="mt-5 flex flex-col items-start gap-3">
              <a href="#how-it-works" className="text-on-surface-variant hover:text-primary">
                How it works
              </a>
              <a href="#transparency" className="text-on-surface-variant hover:text-primary">
                Transparency
              </a>
              <a href="#ai" className="text-on-surface-variant hover:text-primary">
                Platform features
              </a>
              <a href="#faq" className="text-on-surface-variant hover:text-primary">
                FAQ
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-outline-variant/40 px-6 py-6">
          <div className="mx-auto flex max-w-container-max flex-wrap justify-between gap-3 text-sm text-on-surface-variant">
            <span>© {currentYear} Givera</span>
            <span>Built for transparent community fundraising.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
