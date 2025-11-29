import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useBudgetStore = defineStore('budget', () => {
  // --- State ---
  // 按月份儲存的預算 (格式: { "2025-01": { husband: 25000, wife: 25000 }, ... })
  const monthlyBudgets = ref(JSON.parse(localStorage.getItem('monthlyBudgets')) || {})
  
  // 獲取當前月份字符串 (YYYY-MM)
  const getCurrentMonthStr = () => {
    const now = new Date()
    return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }
  
  // 獲取指定月份的預算 (預設 丈夫25000, 老婆25000)
  const getBudgetForMonth = (monthStr) => {
    return monthlyBudgets.value[monthStr] || { husband: 25000, wife: 25000 }
  }
  
  // 當前月份的丈夫預算
  const husbandBudget = computed(() => {
    const monthStr = getCurrentMonthStr()
    return getBudgetForMonth(monthStr).husband
  })
  
  // 當前月份的老婆預算
  const wifeBudget = computed(() => {
    const monthStr = getCurrentMonthStr()
    return getBudgetForMonth(monthStr).wife
  })
  
  // 當前月份的家庭總預算 (自動計算)
  const monthlyBudget = computed(() => husbandBudget.value + wifeBudget.value)
  
  // 記帳紀錄列表
  const records = ref(JSON.parse(localStorage.getItem('records')) || [])

  // --- Actions ---
  const setBudget = (amount) => {
    // 為當前月份設定預算，均分給丈夫和老婆
    const monthStr = getCurrentMonthStr()
    const husband = Math.floor(amount / 2)
    const wife = amount - husband
    monthlyBudgets.value[monthStr] = { husband, wife }
  }

  const setBudgets = (husband, wife) => {
    // 為當前月份單獨設定丈夫和老婆的預算
    const monthStr = getCurrentMonthStr()
    monthlyBudgets.value[monthStr] = { husband, wife }
  }

  const setBudgetsForMonth = (monthStr, husband, wife) => {
    // 為指定月份設定預算
    monthlyBudgets.value[monthStr] = { husband, wife }
  }

  const addRecord = (record) => {
    records.value.push({
      id: Date.now(),
      ...record
    })
    checkBudgetAlert() // 新增後檢查是否超標
  }

  const updateRecord = (id, updates) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index > -1) {
      records.value[index] = {
        ...records.value[index],
        ...updates
      }
    }
  }

  const deleteRecord = (id) => {
    const index = records.value.findIndex(r => r.id === id)
    if (index > -1) {
      records.value.splice(index, 1)
    }
  }

  // 計算當月總花費
  const currentMonthExpense = computed(() => {
    const now = new Date()
    const currentMonthStr = `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    return records.value
      .filter(r => r.date.startsWith(currentMonthStr))
      .reduce((sum, r) => sum + r.amount, 0)
  })

  // 計算剩餘預算百分比
  const remainingPercentage = computed(() => {
    if (monthlyBudget.value === 0) return 0
    const remaining = monthlyBudget.value - currentMonthExpense.value
    return (remaining / monthlyBudget.value) * 100
  })

  // --- 告警邏輯 ---
  const checkBudgetAlert = () => {
    const pct = remainingPercentage.value
    let message = ''
    
    // 邏輯：檢查剩餘百分比區間
    // 注意：這裡只做簡單演示，實際應用可能需要防止重複彈出
    if (pct <= 10 && pct > 0) message = '⚠️ 警告：本月預算僅剩不到 10%！'
    else if (pct <= 20 && pct > 10) message = '⚠️ 注意：本月預算剩餘不到 20%。'
    else if (pct <= 30 && pct > 20) message = 'ℹ️ 提醒：本月預算剩餘 30%。'
    else if (pct <= 50 && pct > 40) message = 'ℹ️ 提醒：本月預算已使用一半 (剩餘 50%)。'
    else if (pct <= 0) message = '❌ 緊急：本月預算已用罄！'

    if (message) {
      alert(`${message}\n目前花費: $${currentMonthExpense.value} / 預算: $${monthlyBudget.value}`)
    }
  }

  // --- Persistence (自動存檔) ---
  watch(monthlyBudgets, (val) => localStorage.setItem('monthlyBudgets', JSON.stringify(val)), { deep: true })
  watch(records, (val) => localStorage.setItem('records', JSON.stringify(val)), { deep: true })

  return { 
    monthlyBudgets,
    getCurrentMonthStr,
    getBudgetForMonth,
    husbandBudget,
    wifeBudget,
    monthlyBudget, 
    records, 
    setBudget,
    setBudgets,
    setBudgetsForMonth, 
    addRecord,
    updateRecord,
    deleteRecord, 
    currentMonthExpense,
    remainingPercentage 
  }
})