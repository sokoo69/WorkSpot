"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'bn' : 'en';
    startTransition(() => {
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPathname = segments.join('/');
      router.push(newPathname);
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="p-2 text-[var(--ink)]/60 hover:text-[var(--ink)] hover:bg-[var(--line)] rounded-full transition-colors flex items-center gap-1 group"
      title={`Switch to ${locale === 'en' ? 'Bengali' : 'English'}`}
    >
      <Globe className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      <span className="text-[10px] font-bold uppercase tracking-widest">{locale}</span>
    </button>
  );
}
