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
  memberId: z.string().min(1, 'Member ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().nullable().optional()
});

export const expenseUpdateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  memberId: z.string().min(1, 'Member ID is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().nullable().optional()
});

export const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
});

export const monthSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format')
});
