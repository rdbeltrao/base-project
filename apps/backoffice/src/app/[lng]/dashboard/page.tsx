'use client'; // This page uses client components and hooks like useState

import { useState } from 'react';
import DashboardChart from '../../../components/dashboard-chart'; // Adjusted path
import DateFilter from '../../../components/date-filter'; // Adjusted path
import { useTranslation } from '@test-pod/translation/client'; // Using client hook
import { useParams } from 'next/navigation';

// Define the app-specific locale loader for backoffice
const backofficeLocaleLoader = (language, namespace) => {
  return import(`../../../locales/${language}/${namespace}.json`);
};

export default function Dashboard() {
  const params = useParams();
  const lng = params.lng as string;

  // Initialize useTranslation with the language and app-specific loader
  // Pass 'backoffice' as the namespace, and also 'common' if needed
  const { t } = useTranslation(lng, ['backoffice', 'common'], undefined, backofficeLocaleLoader);

  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const handleDateFilterChange = (startDate: string, endDate: string) => {
    setDateFilter({ startDate, endDate });
  };

  return (
    <div className='space-y-6'>
      {/* Example of using translation for the title */}
      <h1 className='text-2xl font-bold tracking-tight'>{t('dashboard.title', { ns: 'backoffice' })}</h1>

      <p>{t('dashboard.welcome', { ns: 'backoffice' })}</p>
      <p>{t('greeting', { ns: 'common' })}! {t('language', { ns: 'common' })}: {lng}</p>


      <DateFilter onFilterChange={handleDateFilterChange} />
      <DashboardChart startDate={dateFilter.startDate} endDate={dateFilter.endDate} />
    </div>
  );
}
