export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwB-cwh8JDoboe8c6R6U3-euZfz9fVo2_JgHtB2yN-VUD4TbL7AyN9Grtiu3xFEcRHA/exec';

export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = '@Fefevan1512';

export const STATUS_OPTIONS = ['Proses', 'Selesai', 'Ditolak'] as const;
export type StatusType = (typeof STATUS_OPTIONS)[number];

export const STATUS_COLOR: Record<string, string> = {
  Proses: 'bg-amber-100 text-amber-700 border-amber-200',
  Selesai: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Ditolak: 'bg-red-100 text-red-700 border-red-200',
};
