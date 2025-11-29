<template>
  <header>
    <h1>🏠 家庭記帳日曆</h1>
    <div class="status-bar">
      <span>{{ currentMonthStr }}</span>
      <span>本月預算: ${{ store.monthlyBudget }}</span>
      <span :class="{ 'text-warning': store.remainingPercentage < 50, 'text-danger': store.remainingPercentage < 20 }">
        已花費: ${{ store.currentMonthExpense }} (剩餘 {{ store.remainingPercentage.toFixed(1) }}%)
      </span>
      <button @click="$emit('openSettings')" class="btn-settings">⚙️ 設定預算</button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { useBudgetStore } from '@/stores/budgetStore'

const store = useBudgetStore()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()

const currentMonthStr = computed(() => {
  return format(new Date(currentYear, currentMonth), 'yyyy年MM月', { locale: zhTW })
})

defineEmits(['openSettings'])
</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 3px solid #10b981;
  padding-bottom: 15px;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #1f2937;
}

.status-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-weight: 500;
  align-items: center;
}

.status-bar span {
  color: #374151;
}

.text-warning {
  color: #f59e0b !important;
  font-weight: 600;
}

.text-danger {
  color: #ef4444 !important;
  font-weight: 700;
}

.btn-settings {
  padding: 8px 16px;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-settings:hover {
  background-color: #4b5563;
}
</style>
