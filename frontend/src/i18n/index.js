import { createI18n } from 'vue-i18n'

const STORAGE_KEY = 'family-budget-locale'

const messages = {
  en: {
    app: {
      title: 'Family Budget Hub',
      subtitle: 'Track daily spending, split contributions, and prepare the next deposit.'
    },
    nav: {
      home: 'Home',
      setting: 'Settings',
      account: 'Account'
    },
    summary: {
      thisMonth: 'This month',
      members: 'Members',
      active: '{count} active',
      accountBalance: 'Account Balance'
    },
    alerts: {
      setupTitle: 'Start by adding family members.',
      setupSubtitle: 'Set monthly contributions before tracking expenses.'
    },
    calendar: {
      title: 'Calendar',
      subtitle: 'Select a day to review expenses.',
      items: '{count} items',
      empty: 'No expenses recorded for this day.'
    },
    expenseForm: {
      title: 'Add Expense',
      subtitle: 'Record daily spending.',
      date: 'Date',
      member: 'Member',
      category: 'Category',
      amount: 'Amount (NT$)',
      note: 'Note',
      notePlaceholder: 'Optional',
      selectMember: 'Select member',
      selectCategory: 'Select category',
      paymentSource: 'Payment Source',
      selectPaymentSource: 'Select payment source',
      requiredError: 'Please complete all required fields.',
      amountError: 'Amount must be greater than zero.',
      saveError: 'Failed to save expense.',
      updateError: 'Failed to update expense.',
      removeError: 'Failed to remove expense.',
      save: 'Save expense',
      saving: 'Saving...'
    },
    analytics: {
      title: 'Analytics',
      subtitle: 'Category totals by period.',
      period: 'Period',
      month: 'Month',
      quarter: 'Quarter',
      year: 'Year',
      total: 'Total',
      q1: 'Q1',
      q2: 'Q2',
      q3: 'Q3',
      q4: 'Q4'
    },
    remittance: {
      title: 'Remittance',
      subtitle: 'Next month deposit plan.',
      targetMonth: 'Target month',
      basedOn: 'Based on {month}',
      empty: 'Add members to calculate remittance.',
      advance: 'Advance',
      nextDeposit: 'Next deposit',
      transferBack: 'Transfer back'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage members and categories.',
      membersTitle: 'Members',
      categoriesTitle: 'Categories'
    },
    member: {
      namePlaceholder: 'Name',
      contributionPlaceholder: 'Monthly contribution (NT$)',
      perMonth: '/ month',
      add: 'Add member',
      update: 'Update member',
      requiredError: 'Name and monthly contribution are required.',
      amountError: 'Monthly contribution must be greater than zero.',
      removeBlocked: 'Member has expenses and cannot be removed.'
    },
    category: {
      namePlaceholder: 'Category name',
      add: 'Add category',
      update: 'Update category',
      requiredError: 'Category name is required.',
      inUse: 'Category is in use and was disabled instead.',
      active: 'Active',
      disabled: 'Disabled'
    },
    actions: {
      clear: 'Clear',
      edit: 'Edit',
      remove: 'Remove',
      toggle: 'Toggle',
      cancel: 'Cancel',
      save: 'Save'
    },
    chart: {
      spendLabel: 'Spend'
    },
    account: {
      title: 'Household Account',
      subtitle: 'Manage household funds and transactions.',
      bankName: 'Bank Name',
      accountNumber: 'Account Number',
      initialBalance: 'Initial Balance',
      currentBalance: 'Current Balance',
      totalDeposit: 'Total Deposits',
      totalPayment: 'Total Payments',
      depositForm: {
        title: 'Record Deposit',
        date: 'Date',
        member: 'Member',
        amount: 'Amount (NT$)',
        note: 'Note',
        notePlaceholder: 'Optional',
        selectMember: 'Select member',
        save: 'Record Deposit',
        saving: 'Recording...'
      },
      transactions: {
        title: 'Transaction History',
        filter: 'Filter',
        all: 'All',
        deposit: 'Deposits',
        payment: 'Payments',
        empty: 'No transactions yet.'
      },
      type: {
        deposit: 'Deposit',
        payment: 'Payment'
      },
      paymentSource: 'Payment Source',
      memberAccount: 'Member Account',
      householdAccount: 'Household Account',
      editAccount: 'Edit Account'
    },
    confirm: {
      removeExpense: 'Are you sure you want to remove this expense?',
      removeMember: 'Are you sure you want to remove this member?',
      removeCategory: 'Are you sure you want to remove this category?',
      removeTransaction: 'Are you sure you want to remove this transaction?'
    }
  },
  'zh-TW': {
    app: {
      title: '家庭記帳中心',
      subtitle: '記錄每日支出、分攤費用並準備下月匯款。'
    },
    nav: {
      home: '首頁',
      setting: '設定',
      account: '帳戶'
    },
    summary: {
      thisMonth: '本月支出',
      members: '成員',
      active: '共 {count} 位',
      accountBalance: '家用帳戶餘額'
    },
    alerts: {
      setupTitle: '請先新增家庭成員。',
      setupSubtitle: '設定每月固定存入金額後即可開始記帳。'
    },
    calendar: {
      title: '月曆',
      subtitle: '點選日期查看支出。',
      items: '{count} 筆',
      empty: '此日期尚無支出記錄。'
    },
    expenseForm: {
      title: '新增支出',
      subtitle: '記錄每日支出。',
      date: '日期',
      member: '成員',
      category: '支出類型',
      amount: '金額 (NT$)',
      note: '備註',
      notePlaceholder: '選填',
      selectMember: '選擇成員',
      selectCategory: '選擇類型',
      paymentSource: '支付來源',
      selectPaymentSource: '選擇支付來源',
      requiredError: '請完成所有必填欄位。',
      amountError: '金額需大於 0。',
      saveError: '儲存支出失敗。',
      updateError: '更新支出失敗。',
      removeError: '刪除支出失敗。',
      save: '儲存支出',
      saving: '儲存中...'
    },
    analytics: {
      title: '分析',
      subtitle: '依期間彙整支出類別。',
      period: '期間',
      month: '月份',
      quarter: '季度',
      year: '年份',
      total: '總計',
      q1: '第 1 季',
      q2: '第 2 季',
      q3: '第 3 季',
      q4: '第 4 季'
    },
    remittance: {
      title: '匯款提醒',
      subtitle: '下月匯款計畫。',
      targetMonth: '目標月份',
      basedOn: '依據 {month}',
      empty: '請先新增成員以計算匯款。',
      advance: '上月墊付',
      nextDeposit: '下月匯款',
      transferBack: '應收款'
    },
    settings: {
      title: '設定',
      subtitle: '管理成員與類別。',
      membersTitle: '成員',
      categoriesTitle: '類別'
    },
    member: {
      namePlaceholder: '姓名',
      contributionPlaceholder: '每月固定存入金額 (NT$)',
      perMonth: '/ 月',
      add: '新增成員',
      update: '更新成員',
      requiredError: '姓名與每月固定存入金額為必填。',
      amountError: '每月固定存入金額需大於 0。',
      removeBlocked: '成員已有支出紀錄，無法刪除。'
    },
    category: {
      namePlaceholder: '類別名稱',
      add: '新增類別',
      update: '更新類別',
      requiredError: '請輸入類別名稱。',
      inUse: '類別已被使用，已改為停用。',
      active: '啟用',
      disabled: '停用'
    },
    actions: {
      clear: '清除',
      edit: '編輯',
      remove: '刪除',
      toggle: '切換',
      cancel: '取消',
      save: '儲存'
    },
    chart: {
      spendLabel: '支出'
    },
    account: {
      title: '家用銀行帳戶',
      subtitle: '管理家用資金與交易記錄。',
      bankName: '銀行名稱',
      accountNumber: '帳號',
      initialBalance: '初始餘額',
      currentBalance: '目前餘額',
      totalDeposit: '總匯款',
      totalPayment: '總支出',
      depositForm: {
        title: '記錄匯款',
        date: '日期',
        member: '匯款成員',
        amount: '金額 (NT$)',
        note: '備註',
        notePlaceholder: '選填',
        selectMember: '選擇成員',
        save: '記錄匯款',
        saving: '記錄中...'
      },
      transactions: {
        title: '交易記錄',
        filter: '篩選',
        all: '全部',
        deposit: '匯款',
        payment: '支出',
        empty: '尚無交易記錄。'
      },
      type: {
        deposit: '匯款',
        payment: '支出'
      },
      paymentSource: '支付來源',
      memberAccount: '成員帳戶',
      householdAccount: '家用帳戶',
      editAccount: '編輯帳戶'
    },
    confirm: {
      removeExpense: '確定要刪除這筆支出嗎？',
      removeMember: '確定要刪除這位成員嗎？',
      removeCategory: '確定要刪除這個類別嗎？',
      removeTransaction: '確定要刪除這筆交易嗎？'
    }
  }
}

const getInitialLocale = () => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return saved
    }
  }
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.startsWith('zh') ? 'zh-TW' : 'en'
  }
  return 'zh-TW'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'zh-TW',
  messages
})

export const setLocale = (value) => {
  i18n.global.locale.value = value
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, value)
  }
}

export default i18n
