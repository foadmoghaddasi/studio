import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toPersianNumerals(n: number | string): string {
  if (typeof n === 'number') {
    n = n.toString();
  }
  if (n === null || n === undefined || typeof n !== 'string' || n === '') {
    return '';
  }
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.replace(/[0-9]/g, (digit) => persianNumerals[parseInt(digit)]);
}
