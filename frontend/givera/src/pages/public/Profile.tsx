
import { ChatAssistant } from "../../components/ui/ChatAssistant";


import React, { useState } from 'react';
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  BellIcon,
  ShieldIcon,
  CreditCardIcon,
  HeartIcon,
  FileTextIcon,
  ChevronRightIcon } from
'lucide-react';

const AVATAR_URL = "../../../src/images/profile.jpg";


type Field = {label: string;value: string;icon: React.ReactNode;};


const PERSONAL_FIELDS: Field[] = [
  
{ label: 'Email', value: 'jordan.avery@example.com', icon: <MailIcon className="h-4 w-4" /> },
{ label: 'Phone', value: '+1 (415) 555-0192', icon: <PhoneIcon className="h-4 w-4" /> },
{ label: 'Location', value: 'San Francisco, CA', icon: <MapPinIcon className="h-4 w-4" /> },
{ label: 'Member since', value: 'March 2023', icon: <CalendarIcon className="h-4 w-4" /> }];


const STATS = [
{ label: 'Total contributed', value: '$1,245' },
{ label: 'Campaigns supported', value: '5' },
{ label: 'Receipts on file', value: '5' }];


type Preference = {title: string;description: string;enabled: boolean;icon: React.ReactNode;};

const INITIAL_PREFERENCES: Preference[] = [
{
  title: 'Impact updates',
  description: 'Get progress reports from campaigns you support.',
  enabled: true,
  icon: <BellIcon className="h-4 w-4" />
},
{
  title: 'Recurring giving',
  description: 'Automatically renew your monthly donations.',
  enabled: true,
  icon: <HeartIcon className="h-4 w-4" />
},
{
  title: 'Public profile',
  description: 'Show your name on campaigns you support.',
  enabled: false,
  icon: <ShieldIcon className="h-4 w-4" />
}];


const ACCOUNT_LINKS = [
{ title: 'Payment methods', description: '2 cards on file', icon: <CreditCardIcon className="h-5 w-5" /> },
{ title: 'Tax receipts', description: '5 documents available', icon: <FileTextIcon className="h-5 w-5" /> },
{ title: 'Security & password', description: 'Last updated 2 months ago', icon: <ShieldIcon className="h-5 w-5" /> }];


export function Profile() {
  const [preferences, setPreferences] = useState(INITIAL_PREFERENCES);

  const togglePreference = (index: number) => {
    setPreferences((prev) =>
    prev.map((p, i) => i === index ? { ...p, enabled: !p.enabled } : p)
    );
  };

  return (
    <div className="flex min-h-full w-full flex-col bg-[#f4f4f2]">

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        {/* Page heading */}
        <div className="flex flex-col gap-4 border-b border-neutral-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-widest text-neutral-500">
              ACCOUNT
            </p>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-neutral-900">
              Your profile
            </h1>
            <p className="mt-2 max-w-xl text-neutral-600">
              Manage your personal details, giving preferences, and account settings.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 self-start rounded-lg bg-givera px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-givera-dark sm:self-auto">
            
            <PencilIcon className="h-4 w-4" />
            Edit profile
          </button>
        </div>

        {/* Identity card */}
        <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <img
              src={AVATAR_URL}
              alt="Jordan Avery"
              className="h-24 w-24 rounded-full object-cover ring-4 ring-[#f4f4f2]" />
            
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-neutral-900">Jordan Avery</h2>
              <p className="mt-1 text-neutral-500">Individual donor</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-givera/10 px-3 py-1 text-xs font-semibold text-givera">
                <ShieldIcon className="h-3.5 w-3.5" />
                Verified giver
              </span>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {PERSONAL_FIELDS.map((field) =>
            <div key={field.label}>
                <dt className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                  {field.icon}
                  {field.label}
                </dt>
                <dd className="mt-1 text-base font-semibold text-neutral-900">
                  {field.value}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((stat) =>
          <div
            key={stat.label}
            className="rounded-2xl border border-neutral-200 bg-white p-6">
            
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="mt-2 text-3xl font-extrabold text-neutral-900">
                {stat.value}
              </p>
            </div>
          )}
        </section>

        {/* Two-column: preferences + account settings */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Giving preferences */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <h3 className="text-lg font-bold text-neutral-900">Giving preferences</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Control how you receive updates and give.
            </p>
            <ul className="mt-6 space-y-5">
              {preferences.map((pref, index) =>
              <li key={pref.title} className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-givera/10 text-givera">
                      {pref.icon}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {pref.title}
                      </p>
                      <p className="text-sm text-neutral-500">{pref.description}</p>
                    </div>
                  </div>
                  <button
                  type="button"
                  role="switch"
                  aria-checked={pref.enabled}
                  aria-label={`Toggle ${pref.title}`}
                  onClick={() => togglePreference(index)}
                  className={`relative mt-1 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  pref.enabled ? 'bg-givera' : 'bg-neutral-300'}`
                  }>
                  
                    <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    pref.enabled ? 'translate-x-5' : 'translate-x-0.5'}`
                    } />
                  
                  </button>
                </li>
              )}
            </ul>
          </section>

          {/* Account settings */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <h3 className="text-lg font-bold text-neutral-900">Account settings</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Payments, receipts, and security.
            </p>
            <ul className="mt-6 divide-y divide-neutral-100">
              {ACCOUNT_LINKS.map((link) =>
              <li key={link.title}>
                  <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-4 py-4 text-left">
                  
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                        {link.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {link.title}
                        </p>
                        <p className="text-sm text-neutral-500">{link.description}</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-neutral-400 transition-colors group-hover:text-neutral-700" />
                  </button>
                </li>
              )}
            </ul>
          </section>
        </div>
      </main>

      <ChatAssistant />
    </div>);

}