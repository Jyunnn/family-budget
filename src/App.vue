<template>
  <div class="app-container">
    <Header @openSettings="showSettings = true" />
    
    <div class="main-content">
      <!-- 左邊：日曆 -->
      <div class="calendar-section">
        <Calendar @selectDate="handleSelectDate" :selectedDate="selectedDate" />
      </div>
      
      <!-- 右邊：表格 -->
      <div class="table-section">
        <ExpenseTable 
          :selectedDate="selectedDate"
          @addExpense="handleAddExpense"
        />
      </div>
    </div>

    <BudgetSettingsModal 
      :isOpen="showSettings" 
      @close="showSettings = false"
      @save="handleBudgetSaved"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header.vue'
import Calendar from '@/components/Calendar.vue'
import ExpenseTable from '@/components/ExpenseTable.vue'
import BudgetSettingsModal from '@/components/BudgetSettingsModal.vue'
import { useBudgetStore } from './stores/budgetStore'

const store = useBudgetStore()
const showSettings = ref(false)
const selectedDate = ref('')

const handleSelectDate = (dateStr) => {
  selectedDate.value = dateStr
}

const handleAddExpense = () => {
  // 重新加載日曆
}

const handleBudgetSaved = () => {
  showSettings.value = false
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

body {
  background-color: #f5f5f5;
}

.app-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: 20px;
  background-color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  display: flex;
  gap: 20px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.calendar-section {
  width: 40%;
  min-width: 300px;
  overflow-y: auto;
  padding-right: 10px;
}

.table-section {
  width: 60%;
  min-width: 400px;
  overflow-y: auto;
  padding-left: 10px;
  border-left: 1px solid #e5e7eb;
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }

  .calendar-section {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
    padding-right: 0;
    padding-bottom: 10px;
  }

  .table-section {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e5e7eb;
    padding-left: 0;
    padding-top: 10px;
  }
}

@media (max-width: 640px) {
  .app-container {
    padding: 10px;
  }
}
</style>
