<template>
  <div class="container">
    <header>
      <h1>🏠 家庭記帳日曆</h1>
      <div class="status-bar">
        <span>{{ currentMonthStr }}</span>
        <span>本月預算: ${{ store.monthlyBudget }}</span>
        <span :class="{ 'text-warning': store.remainingPercentage < 50, 'text-danger': store.remainingPercentage < 20 }">
          已花費: ${{ store.currentMonthExpense }} (剩餘 {{ store.remainingPercentage.toFixed(1) }}%)
        </span>
        <button @click="showSettings = true" class="btn-settings">⚙️ 設定預算</button>
      </div>
    </header>

    <div class="calendar-grid">
      <div class="day-header" v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day">{{ day }}</div>
      
      <div 
        v-for="(date, index) in calendarDays" 
        :key="index" 
        class="day-cell"
        :class="{ 'empty': !date }"
        @click="openAddModal(date)"
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

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>新增支出</h3>
          <button class="close-btn" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <p class="date-display">{{ formatDateDisplay(selectedDate) }}</p>
          
          <div class="form-group">
            <label>金額 *</label>
            <input type="number" v-model.number="form.amount" placeholder="輸入金額" min="0" step="0.01">
          </div>
          
          <div class="form-group">
            <label>類別 *</label>
            <select v-model="form.category">
              <option>食物費</option>
              <option>交通費</option>
              <option>娛樂</option>
              <option>帳單</option>
              <option>其他</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>角色 *</label>
            <div class="role-group">
              <label class="radio-label">
                <input type="radio" value="husband" v-model="form.role"> 丈夫 👨
              </label>
              <label class="radio-label">
                <input type="radio" value="wife" v-model="form.role"> 老婆 👩
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="submitExpense" class="btn-primary">儲存</button>
          <button @click="showModal = false" class="btn-cancel">取消</button>
        </div>
      </div>
    </div>

    <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
      <div class="modal">
        <div class="modal-header">
          <h3>設定家庭月預算</h3>
          <button class="close-btn" @click="showSettings = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>每月預算金額 *</label>
            <input type="number" v-model.number="tempBudget" placeholder="輸入預算金額" min="0">
          </div>
        </div>
        <div class="modal-footer">
          <button @click="saveBudget" class="btn-primary">確定</button>
          <button @click="showSettings = false" class="btn-cancel">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getDaysInMonth, getDay, format } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import { useBudgetStore } from './stores/budgetStore'

const store = useBudgetStore()
const showModal = ref(false)
const showSettings = ref(false)
const selectedDate = ref('')
const tempBudget = ref(store.monthlyBudget)

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth()

// 計算當月天數
const daysCount = getDaysInMonth(new Date(currentYear, currentMonth))
const firstDayOfMonth = getDay(new Date(currentYear, currentMonth, 1)) // 0=週日

// 生成日曆數組：包含空白日期和實際日期
const calendarDays = computed(() => {
  const days = []
  // 補充前面的空白
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  // 添加當月日期
  for (let i = 1; i <= daysCount; i++) {
    days.push(i)
  }
  return days
})

const form = ref({
  amount: 0,
  category: '食物費',
  role: 'husband'
})

// 當月字符串顯示
const currentMonthStr = computed(() => {
  return format(new Date(currentYear, currentMonth), 'yyyy年MM月', { locale: zhTW })
})

// 格式化日期顯示
const formatDateDisplay = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

// 根據日期過濾資料
const getRecordsByDay = (day) => {
  if (!day) return []
  const dateStr = `${String(currentYear).padStart(4, '0')}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return store.records.filter(r => r.date === dateStr)
}

const openAddModal = (day) => {
  if (!day) return
  selectedDate.value = `${String(currentYear).padStart(4, '0')}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  form.value = { amount: 0, category: '食物費', role: 'husband' }
  showModal.value = true
}

const submitExpense = () => {
  if (form.value.amount <= 0) return alert('請輸入金額')
  
  store.addRecord({
    date: selectedDate.value,
    amount: form.value.amount,
    category: form.value.category,
    role: form.value.role
  })
  showModal.value = false
}

const saveBudget = () => {
  if (tempBudget.value <= 0) return alert('請輸入有效的預算金額')
  store.setBudget(tempBudget.value)
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

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

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

/* 日曆網格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-bottom: 30px;
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
  min-height: 120px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
  display: flex;
  flex-direction: column;
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

/* 花費標籤 */
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

/* 彈窗背景 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 20px;
  flex: 1;
}

.date-display {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 15px 0;
  padding: 10px;
  background-color: #f3f4f6;
  border-radius: 6px;
}

.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 6px;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.role-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-weight: normal;
  color: #374151;
}

.radio-label input[type="radio"] {
  cursor: pointer;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-primary,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #10b981;
  color: white;
}

.btn-primary:hover {
  background-color: #059669;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-cancel {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background-color: #d1d5db;
}

/* 響應式設計 */
@media (max-width: 640px) {
  .container {
    padding: 10px;
  }

  h1 {
    font-size: 22px;
  }

  .status-bar {
    flex-direction: column;
    gap: 10px;
  }

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

  .modal {
    width: 95%;
  }
}
</style>
