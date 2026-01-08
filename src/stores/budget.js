import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { formatDate, formatMonth } from '../utils/date'
import { api, getErrorMessage } from '../api/client'

const DEFAULT_EXPENSE_RANGE = { from: '2025-01-01', to: '2034-12-31' }

export const useBudgetStore = defineStore('budget', () => {
  const members = ref([])
  const categories = ref([])
  const expenses = ref([])
  const selectedDate = ref(formatDate(new Date()))
  const periodFilter = ref({ type: 'month', value: formatMonth(new Date()) })
  const error = ref('')
  const isReady = ref(false)
  const isLoading = ref(false)

  const activeCategories = computed(() => categories.value.filter((item) => item.isActive))

  const setError = (message) => {
    error.value = message
  }

  const clearError = () => {
    error.value = ''
  }

  const loadFromApi = async () => {
    isLoading.value = true
    clearError()
    try {
      const [membersRes, categoriesRes, expensesRes] = await Promise.all([
        api.get('/members'),
        api.get('/categories'),
        api.get('/expenses', { params: DEFAULT_EXPENSE_RANGE })
      ])
      members.value = membersRes.data ?? []
      categories.value = categoriesRes.data ?? []
      expenses.value = expensesRes.data ?? []
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load data.'))
    } finally {
      isReady.value = true
      isLoading.value = false
    }
  }

  const refreshExpenses = async (range = DEFAULT_EXPENSE_RANGE) => {
    clearError()
    try {
      const response = await api.get('/expenses', { params: range })
      expenses.value = response.data ?? []
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load expenses.')
      setError(message)
      return { ok: false, message }
    }
  }

  const setSelectedDate = (value) => {
    selectedDate.value = value
  }

  const setPeriodFilter = (type, value) => {
    periodFilter.value = { type, value }
  }

  const addMember = async ({ name, monthlyContribution }) => {
    clearError()
    try {
      const response = await api.post('/members', {
        name: name?.trim(),
        monthlyContribution: Number(monthlyContribution)
      })
      members.value.push(response.data)
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to add member.')
      setError(message)
      return { ok: false, message }
    }
  }

  const updateMember = async (id, payload) => {
    clearError()
    try {
      await api.put(`/members/${id}`, {
        name: payload.name?.trim(),
        monthlyContribution: Number(payload.monthlyContribution)
      })
      const index = members.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        members.value[index] = { ...members.value[index], ...payload }
      }
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update member.')
      setError(message)
      return { ok: false, message }
    }
  }

  const removeMember = async (id) => {
    clearError()
    try {
      await api.delete(`/members/${id}`)
      members.value = members.value.filter((item) => item.id !== id)
      return { removed: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to remove member.')
      setError(message)
      const reason = err?.response?.status === 409 ? 'in-use' : undefined
      return { removed: false, reason, message }
    }
  }

  const addCategory = async ({ name }) => {
    clearError()
    try {
      const response = await api.post('/categories', { name: name?.trim() })
      categories.value.push(response.data)
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to add category.')
      setError(message)
      return { ok: false, message }
    }
  }

  const updateCategory = async (id, payload) => {
    clearError()
    try {
      const response = await api.put(`/categories/${id}`, {
        name: payload.name?.trim(),
        isActive: payload.isActive
      })
      const index = categories.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update category.')
      setError(message)
      return { ok: false, message }
    }
  }

  const toggleCategory = async (id, value) => {
    return updateCategory(id, { isActive: value })
  }

  const removeCategory = async (id) => {
    clearError()
    try {
      const response = await api.delete(`/categories/${id}`)
      const result = response.data
      if (result?.removed) {
        categories.value = categories.value.filter((item) => item.id !== id)
        return { removed: true }
      }
      const index = categories.value.findIndex((item) => item.id === id)
      if (index !== -1) {
        categories.value[index] = { ...categories.value[index], isActive: false }
      }
      return { removed: false, reason: result?.reason }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to remove category.')
      setError(message)
      return { removed: false, message }
    }
  }

  const addExpense = async ({ date, memberId, categoryId, amount, note }) => {
    clearError()
    try {
      const response = await api.post('/expenses', {
        date,
        memberId,
        categoryId,
        amount: Number(amount),
        note: note?.trim() || null
      })
      expenses.value.unshift(response.data)
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to add expense.')
      setError(message)
      return { ok: false, message }
    }
  }

  const updateExpense = async (id, payload) => {
    clearError()
    try {
      const response = await api.put(`/expenses/${id}`, {
        date: payload.date,
        memberId: payload.memberId,
        categoryId: payload.categoryId,
        amount: Number(payload.amount),
        note: payload.note?.trim() || null
      })
      const index = expenses.value.findIndex((item) => item.id === id)
      const updated = response.data ?? { ...payload, id }
      if (index !== -1) {
        expenses.value[index] = { ...expenses.value[index], ...updated }
      }
      return { ok: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update expense.')
      setError(message)
      return { ok: false, message }
    }
  }

  const removeExpense = async (id) => {
    clearError()
    try {
      await api.delete(`/expenses/${id}`)
      expenses.value = expenses.value.filter((item) => item.id !== id)
      return { removed: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to remove expense.')
      setError(message)
      return { removed: false, message }
    }
  }

  return {
    members,
    categories,
    expenses,
    selectedDate,
    periodFilter,
    error,
    isReady,
    isLoading,
    activeCategories,
    loadFromApi,
    refreshExpenses,
    setSelectedDate,
    setPeriodFilter,
    addMember,
    updateMember,
    removeMember,
    addCategory,
    updateCategory,
    toggleCategory,
    removeCategory,
    addExpense,
    updateExpense,
    removeExpense
  }
})
