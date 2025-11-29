<template>
  <div class="calendar-container">
    <div class="calendar-title">
      <div class="title-control">
        <button class="btn-prev" @click="handlePrevMonth">‹</button>
        <h3>{{ displayYear }} 年 {{ displayMonth + 1 }} 月</h3>
        <button class="btn-next" @click="handleNextMonth">›</button>
      </div>
      <div class="date-selector">
        <select v-model.number="displayYear" class="year-select">
          <option v-for="year in yearOptions" :key="year" :value="year">
            {{ year }} 年
          </option>
        </select>
        <select v-model.number="displayMonth" class="month-select">
          <option v-for="month in 12" :key="month" :value="month - 1">
            {{ String(month).padStart(2, '0') }} 月
          </option>
        </select>
      </div>
    </div>
    
    <div class="calendar-grid">
      <div class="day-header" v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">{{ day }}</div>
      
      <div 
        v-for="(date, index) in calendarDays" 
        :key="index" 
        class="day-cell"
        :class="{ 
          'empty': !date,
          'selected': isSelected(date)
        }"
        @click="handleDayClick(date)"
      >
        <span v-if="date" class="date-num">{{ date }}</span>
        <div v-if="date" class="day-expenses">
          <div v-for="rec in getRecordsByDay(date)" :key="rec.id" class="expense-tag" :class="rec.role">
            <span class="category">{{ rec.category }}</span>
            <span class="amount">${{ rec.amount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getDaysInMonth, getDay } from 'date-fns'
import { useBudgetStore } from '@/stores/budgetStore'

const store = useBudgetStore()

const props = defineProps({
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['selectDate'])

const now = new Date()
const displayYear = ref(now.getFullYear())
const displayMonth = ref(now.getMonth())

const yearOptions = computed(() => {
  const current = now.getFullYear()
  const minYear = 2025
  const maxYear = current + 20
  const options = []
  for (let i = minYear; i <= maxYear; i++) {
    options.push(i)
  }
  return options
})

const daysCount = computed(() => 
  getDaysInMonth(new Date(displayYear.value, displayMonth.value))
)

const firstDayOfMonth = computed(() =>
  getDay(new Date(displayYear.value, displayMonth.value, 1))
)

const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDayOfMonth.value; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysCount.value; i++) {
    days.push(i)
  }
  return days
})

const getRecordsByDay = (day) => {
  if (!day) return []
  const dateStr = `${String(displayYear.value).padStart(4, '0')}-${String(displayMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return store.records.filter(r => r.date === dateStr)
}

const isSelected = (date) => {
  if (!date || !props.selectedDate) return false
  const dateStr = `${String(displayYear.value).padStart(4, '0')}-${String(displayMonth.value + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`
  return dateStr === props.selectedDate
}

const handleDayClick = (day) => {
  if (!day) return
  const dateStr = `${String(displayYear.value).padStart(4, '0')}-${String(displayMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  emit('selectDate', dateStr)
}

const handlePrevMonth = () => {
  if (displayMonth.value === 0) {
    displayMonth.value = 11
    displayYear.value--
  } else {
    displayMonth.value--
  }
}

const handleNextMonth = () => {
  if (displayMonth.value === 11) {
    displayMonth.value = 0
    displayYear.value++
  } else {
    displayMonth.value++
  }
}
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.calendar-title {
  margin-bottom: 20px;
}

.title-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.title-control h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
  flex: 1;
  text-align: center;
}

.btn-prev,
.btn-next {
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-prev:hover,
.btn-next:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

.date-selector {
  display: flex;
  gap: 8px;
}

.year-select,
.month-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.3s;
}

.year-select:hover,
.month-select:hover {
  border-color: #9ca3af;
}

.year-select:focus,
.month-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  flex: 1;
  min-height: 0;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 12px;
  background-color: #e5e7eb;
  border-radius: 6px;
  color: #374151;
}

.day-cell {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
  display: flex;
  flex-direction: column;
  min-height: 150px;
}

.day-cell:not(.empty):hover {
  background-color: #f0fdf4;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
  transform: translateY(-2px);
}

.day-cell.empty {
  background-color: #f9fafb;
  cursor: default;
}

.day-cell.selected {
  background-color: #dbeafe;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.date-num {
  font-weight: bold;
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 6px;
}

.day-expenses {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  overflow-y: auto;
}

.expense-tag {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 4px;
  color: white;
  line-height: 1.3;
}

.expense-tag.husband {
  background-color: #3b82f6;
}

.expense-tag.wife {
  background-color: #ec4899;
}

.expense-tag .category {
  flex: 1;
}

.expense-tag .amount {
  font-weight: bold;
}

@media (max-width: 640px) {
  .calendar-grid {
    gap: 4px;
  }

  .day-cell {
    min-height: 80px;
    font-size: 12px;
  }

  .date-num {
    font-size: 14px;
  }
}
</style>
