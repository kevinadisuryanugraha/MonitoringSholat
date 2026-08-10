import React from 'react';
import { StatusSholat } from '../../types';
import { CheckCircle2, Thermometer, FileText, AlertCircle } from 'lucide-react';
import { Mosque } from './MosqueIcon';

interface Props {
  status: StatusSholat | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md', showIcon = true }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'berjamaah':
        return {
          label: 'Hadir Berjamaah',
          shortLabel: 'Berjamaah',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'munfarid':
        return {
          label: 'Hadir Munfarid',
          shortLabel: 'Munfarid',
          bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
          icon: <Mosque className="w-3.5 h-3.5 text-sky-600" />
        };
      case 'sakit':
        return {
          label: 'Sakit',
          shortLabel: 'Sakit',
          bg: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          icon: <Thermometer className="w-3.5 h-3.5 text-slate-500" />
        };
      case 'izin':
        return {
          label: 'Izin',
          shortLabel: 'Izin',
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          icon: <FileText className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'alpha':
        return {
          label: 'Alpha (Tanpa Ket.)',
          shortLabel: 'Alpha',
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        };
      default:
        return {
          label: 'Belum Diisi',
          shortLabel: 'Belum',
          bg: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
          icon: null
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  return (
    <span className={`inline-flex items-center rounded-md border ${config.bg} ${sizeClasses[size]} whitespace-nowrap`}>
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};
