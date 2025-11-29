<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <div class="modal-header">
        <h3>設定家庭月預算</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>選擇月份 *</label>
          <input type="month" v-model="selectedMonth">
        </div>
        <div class="form-group">
          <label>丈夫的預算 *</label>
          <input type="number" v-model.number="husbandBudget" placeholder="輸入丈夫的預算金額" min="0">
        </div>
        <div class="form-group">
          <label>老婆的預算 *</label>
          <input type="number" v-model.number="wifeBudget" placeholder="輸入老婆的預算金額" min="0">
        </div>
        <div class="form-group total-display">
          <label>每月家庭預算合計</label>
          <div class="total-amount">{{ totalBudget }}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleSave" class="btn-primary">確定</button>
        <button @click="handleClose" class="btn-cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'

const store = useBudgetStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const selectedMonth = ref(store.getCurrentMonthStr())
const husbandBudget = ref(0)
const wifeBudget = ref(0)

const totalBudget = computed(() => {
  return husbandBudget.value + wifeBudget.value
})

// 當月份改變時，載入該月份的預算
const loadBudgetForMonth = (monthStr) => {
  const budget = store.getBudgetForMonth(monthStr)
  husbandBudget.value = budget.husband
  wifeBudget.value = budget.wife
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedMonth.value = store.getCurrentMonthStr()
    loadBudgetForMonth(selectedMonth.value)
  }
})

watch(selectedMonth, (newMonth) => {
  loadBudgetForMonth(newMonth)
})

const handleSave = () => {
  if (!selectedMonth.value) {
    alert('請選擇月份')
    return
  }
  
  if (husbandBudget.value < 0 || wifeBudget.value < 0) {
    alert('請輸入有效的預算金額')
    return
  }
  
  if (totalBudget.value <= 0) {
    alert('家庭預算合計必須大於 0')
    return
  }
  
  store.setBudgetsForMonth(selectedMonth.value, husbandBudget.value, wifeBudget.value)
  emit('save')
  handleClose()
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
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

.total-display {
  background-color: #f0fdf4;
  padding: 12px;
  border-radius: 6px;
  margin-top: 12px;
}

.total-display label {
  color: #047857;
  margin-bottom: 8px;
}

.total-amount {
  font-size: 24px;
  font-weight: bold;
  color: #047857;
  text-align: center;
}
</style>
