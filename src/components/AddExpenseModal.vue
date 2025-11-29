<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleClose">
    <div class="modal">
      <div class="modal-header">
        <h3>新增支出</h3>
        <button class="close-btn" @click="handleClose">×</button>
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
        <button @click="handleSubmit" class="btn-primary">儲存</button>
        <button @click="handleClose" class="btn-cancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'

const store = useBudgetStore()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  amount: 0,
  category: '食物費',
  role: 'husband'
})

// 當選中日期改變時，重置表單
watch(() => props.selectedDate, () => {
  form.value = { amount: 0, category: '食物費', role: 'husband' }
})

const formatDateDisplay = (dateStr) => {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${year}年${month}月${day}日`
}

const handleSubmit = () => {
  if (form.value.amount <= 0) {
    alert('請輸入金額')
    return
  }
  
  store.addRecord({
    date: props.selectedDate,
    amount: form.value.amount,
    category: form.value.category,
    role: form.value.role
  })
  
  emit('submit')
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
</style>
