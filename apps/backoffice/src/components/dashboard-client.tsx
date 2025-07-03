'use client';

import { useState } from 'react';
import DashboardChart from './dashboard-chart';
import DateFilter from './date-filter';

interface Translations {
  title: string;
  welcome: string;
  greeting: string;
  language: string;
}

interface DashboardClientProps {
  translations: Translations;
  lng: string;
}

export default function DashboardClient({ translations, lng }: DashboardClientProps) {
  const [dateFilter, setDateFilter] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const handleDateFilterChange = (startDate: string, endDate: string) => {
    setDateFilter({ startDate, endDate });
  };

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold tracking-tight'>{translations.title}</h1>
      <p>{translations.welcome}</p>
      <p>{translations.greeting}! {translations.language}: {lng}</p>
      <DateFilter onFilterChange={handleDateFilterChange} />
      <DashboardChart startDate={dateFilter.startDate} endDate={dateFilter.endDate} />
    </div>
  );
} 