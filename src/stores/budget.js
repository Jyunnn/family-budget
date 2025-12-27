import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { formatDate, formatMonth } from '../utils/date'

const STORAGE_KEY = 'family-budget-state-v1'

const defaultCategoryNames = {
  en: ['Food', 'Household', 'Transport', 'Utilities', 'Other'],
  'zh-TW': ['食材餐費', '水電五金', '交通運輸', '水電費', '其他費用']
}

const getDefaultCategories = () => {
  let locale = 'zh-TW'
  if (typeof localStorage !== 'undefined') {
    const savedLocale = localStorage.getItem('family-budget-locale')
    if (savedLocale) {
      locale = savedLocale
    }
  }
  if (typeof navigator !== 'undefined' && navigator.language && locale === 'zh-TW') {
    locale = navigator.language.startsWith('zh') ? 'zh-TW' : 'en'
  }
  const names = defaultCategoryNames[locale] || defaultCategoryNames.en
  return [
    { id: 'c_food', name: names[0], isActive: true },
    { id: 'c_household', name: names[1], isActive: true },
    { id: 'c_transport', name: names[2], isActive: true },
    { id: 'c_utilities', name: names[3], isActive: true },
    { id: 'c_other', name: names[4], isActive: true }
  ]
}

const createId = (prefix) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export const useBudgetStore = defineStore('budget', () => {
  const members = ref([])
  const categories = ref(getDefaultCategories())
  const expenses = ref([])
  const selectedDate = ref(formatDate(new Date()))
  const periodFilter = ref({ type: 'month', value: formatMonth(new Date()) })
  const error = ref('')
  const isReady = ref(false)

  const activeCategories = computed(() => categories.value.filter((item) => item.isActive))

  const setError = (message) => {
    error.value = message
  }

  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        members.value = data.members ?? []
        categories.value = data.categories ?? getDefaultCategories()
        expenses.value = data.expenses ?? []
      }
      isReady.value = true
    } catch (err) {
      setError('Failed to load saved data.')
      isReady.value = true
      console.error('Storage load error:', err)
    }
  }

  const persistState = () => {
    try {
      const payload = {
        members: members.value,
        categories: categories.value,
        expenses: expenses.value
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch (err) {
      setError('Failed to save data.')
      console.error('Storage save error:', err)
    }
  }

  watch([members, categories, expenses], persistState, { deep: true })

  const setSelectedDate = (value) => {
    selectedDate.value = value
  }

  const setPeriodFilter = (type, value) => {
    periodFilter.value = { type, value }
  }

  const addMember = ({ name, monthlyContribution }) => {
    members.value.push({
      id: createId('m'),
      name,
      monthlyContribution: Number(monthlyContribution)
    })
  }

  const updateMember = (id, payload) => {
    const index = members.value.findIndex((item) => item.id === id)
    if (index === -1) return false
    members.value[index] = { ...members.value[index], ...payload }
    return true
  }

  const removeMember = (id) => {
    const inUse = expenses.value.some((expense) => expense.memberId === id)
    if (inUse) {
      return { removed: false, reason: 'in-use' }
    }
    members.value = members.value.filter((item) => item.id !== id)
    return { removed: true }
  }

  const addCategory = ({ name }) => {
    categories.value.push({ id: createId('c'), name, isActive: true })
  }

  const updateCategory = (id, payload) => {
    const index = categories.value.findIndex((item) => item.id === id)
    if (index === -1) return false
    categories.value[index] = { ...categories.value[index], ...payload }
    return true
  }

  const toggleCategory = (id, value) => {
    const index = categories.value.findIndex((item) => item.id === id)
    if (index === -1) return false
    categories.value[index].isActive = value
    return true
  }

  const removeCategory = (id) => {
    const inUse = expenses.value.some((expense) => expense.categoryId === id)
    if (inUse) {
      toggleCategory(id, false)
      return { removed: false, reason: 'in-use' }
    }
    categories.value = categories.value.filter((item) => item.id !== id)
    return { removed: true }
  }

  const addExpense = ({ date, memberId, categoryId, amount, note }) => {
    expenses.value.push({
      id: createId('e'),
      date,
      memberId,
      categoryId,
      amount: Number(amount),
      note: note?.trim() || ''
    })
  }

  return {
    members,
    categories,
    expenses,
    selectedDate,
    periodFilter,
    error,
    isReady,
    activeCategories,
    loadFromStorage,
    setSelectedDate,
    setPeriodFilter,
    addMember,
    updateMember,
    removeMember,
    addCategory,
    updateCategory,
    toggleCategory,
    removeCategory,
    addExpense
  }
})
