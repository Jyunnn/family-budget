import { randomUUID } from 'crypto';

export function generateId(prefix: string): string {
  const uuid = randomUUID().replace(/-/g, '');
  return `${prefix}_${uuid}`;
}

export function isValidDate(value: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) {
    return false;
  }
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function isValidMonth(value: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(value)) {
    return false;
  }
  const date = new Date(`${value}-01`);
  return !isNaN(date.getTime());
}

export function getPreviousMonth(monthValue: string): string {
  const date = new Date(`${monthValue}-01`);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}
