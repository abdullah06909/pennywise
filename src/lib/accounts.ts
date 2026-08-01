import { Landmark, Smartphone, Banknote, type LucideIcon } from 'lucide-react';
import { AccountId } from '../types';

export const ACCOUNT_IDS: AccountId[] = ['bank', 'easypaisa', 'cash'];

interface AccountMeta {
  name: string;
  icon: LucideIcon;
  variant: 'primary' | 'secondary' | 'accent' | 'neutral';
  badgeClass: string;
}

export const ACCOUNT_META: Record<AccountId, AccountMeta> = {
  bank: {
    name: 'Bank',
    icon: Landmark,
    variant: 'accent',
    badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  easypaisa: {
    name: 'EasyPaisa',
    icon: Smartphone,
    variant: 'primary',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  },
  cash: {
    name: 'Cash',
    icon: Banknote,
    variant: 'neutral',
    badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-200',
  },
};

export function accountName(id: AccountId | undefined | null): string {
  return (id && ACCOUNT_META[id]?.name) ?? 'Unassigned';
}

export const LEGACY_PAYMENT_MODE_TO_ACCOUNT: Record<'Cash' | 'Card' | 'UPI', AccountId> = {
  Cash: 'cash',
  Card: 'bank',
  UPI: 'easypaisa',
};
