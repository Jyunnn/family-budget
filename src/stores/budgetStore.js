import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useBudgetStore = defineStore('budget', () => {
  // --- State ---
  // 每月家庭預算 (預設 50000)
  const monthlyBudget = ref(parseInt(localStorage.getItem('monthlyBudget')) || 50000)
  
  // 記帳紀錄列表
  const records = ref(JSON.parse(localStorage.getItem('records')) || [])

  // --- Actions ---
  const setBudget = (amount) => {
    monthlyBudget.value = amount
  }

  const addRecord = (record) => {
    records.value.push({
      id: Date.now(),
      ...record
    })
    checkBudgetAlert() // 新增後檢查是否超標
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
  watch(monthlyBudget, (val) => localStorage.setItem('monthlyBudget', val))
  watch(records, (val) => localStorage.setItem('records', JSON.stringify(val)), { deep: true })

  return { 
    monthlyBudget, 
    records, 
    setBudget, 
    addRecord, 
    currentMonthExpense,
    remainingPercentage 
  }
})