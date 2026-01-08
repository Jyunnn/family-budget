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
      setting: 'Settings'
    },
    summary: {
      thisMonth: 'This month',
      members: 'Members',
      active: '{count} active'
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
      toggle: 'Toggle'
    },
    chart: {
      spendLabel: 'Spend'
    }
  },
  'zh-TW': {
    app: {
      title: '家庭記帳中心',
      subtitle: '記錄每日支出、分攤費用並準備下月匯款。'
    },
    nav: {
      home: '首頁',
      setting: '設定'
    },
    summary: {
      thisMonth: '本月支出',
      members: '成員',
      active: '共 {count} 位'
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
      toggle: '切換'
    },
    chart: {
      spendLabel: '支出'
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
