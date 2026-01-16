import { z } from 'zod';

export const memberCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  monthlyContribution: z.number().positive('Monthly contribution must be positive')
});

export const memberUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  monthlyContribution: z.number().positive('Monthly contribution must be positive')
});

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Category name is required').trim()
});

export const categoryUpdateSchema = z.object({
  name: z.string().trim().optional(),
  isActive: z.boolean().optional()
}).refine(data => data.name !== undefined || data.isActive !== undefined, {
  message: 'Either name or isActive must be provided'
});

export const expenseCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  memberId: z.string().nullable().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().nullable().optional(),
  isFromHousehold: z.boolean().optional().default(false),
  householdAccountId: z.string().nullable().optional()
}).refine(data => {
  if (data.isFromHousehold) {
    return true;
  }
  return data.memberId !== null && data.memberId !== undefined && data.memberId !== '';
}, {
  message: 'Member ID is required when not from household account',
  path: ['memberId']
}).refine(data => {
  if (!data.isFromHousehold) {
    return true;
  }
  return data.householdAccountId !== null && data.householdAccountId !== undefined;
}, {
  message: 'Household account ID is required when from household account',
  path: ['householdAccountId']
});

export const expenseUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  memberId: z.string().nullable().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().nullable().optional(),
  isFromHousehold: z.boolean().optional(),
  householdAccountId: z.string().nullable().optional()
}).refine(data => {
  if (data.isFromHousehold === undefined) {
    return true;
  }
  if (data.isFromHousehold) {
    return data.householdAccountId !== null && data.householdAccountId !== undefined;
  }
  return data.memberId !== null && data.memberId !== undefined && data.memberId !== '';
}, {
  message: 'Either member ID or household account ID is required based on payment source'
});

export const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
});

export const monthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format')
});

export const householdAccountCreateSchema = z.object({
  name: z.string().min(1, 'Account name is required').trim(),
  bankName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  initialBalance: z.number().int('Initial balance must be an integer').optional()
});

export const householdAccountUpdateSchema = z.object({
  name: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  isActive: z.boolean().optional()
}).refine(data => data.name !== undefined || data.bankName !== undefined || 
                    data.accountNumber !== undefined || data.isActive !== undefined, {
  message: 'At least one field must be provided'
});

export const depositCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  memberId: z.string().min(1, 'Member ID is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().nullable().optional()
});

export const transactionQuerySchema = z.object({
  accountId: z.string().optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  type: z.enum(['DEPOSIT', 'PAYMENT', 'ALL']).optional().default('ALL')
});
