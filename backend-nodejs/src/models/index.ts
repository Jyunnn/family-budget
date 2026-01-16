export interface Member {
  id: string;
  name: string;
  monthlyContribution: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Expense {
  id: string;
  date: string;
  memberId: string;
  categoryId: string;
  amount: number;
  note?: string;
  createdAt?: string;
}

export interface CategorySummary {
  categoryId: string;
  name: string;
  amount: number;
}

export interface Remittance {
  memberId: string;
  name: string;
  paidAdvance: number;
  nextMonthDue: number;
  transferToMember: number;
}

export interface RemoveResult {
  removed: boolean;
  reason?: string;
}

export interface ErrorResponse {
  message: string;
}
