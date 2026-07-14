import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['en', 'bn'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale as any)) {
    locale = 'en';
  }

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
