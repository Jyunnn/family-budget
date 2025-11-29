<template>
  <div class="expense-table-container">
    <div class="table-header">
      <h2>{{ selectedDate ? `${selectedDate} 的花費` : '請選擇日期' }}</h2>
      <button v-if="selectedDate" class="btn-add" @click="handleAddNew">
        + 新增花費
      </button>
    </div>

    <table v-if="selectedDate && expenses.length > 0" class="expense-table">
      <thead>
        <tr>
          <th>類別</th>
          <th>人員</th>
          <th>金額</th>
          <th>備註</th>
          <th style="width: 100px">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="expense in expenses" :key="expense.id" :class="`role-${expense.role}`">
          <td>{{ expense.category }}</td>
          <td>{{ expense.role === 'husband' ? '丈夫' : '妻子' }}</td>
          <td class="amount">${{ expense.amount }}</td>
          <td>{{ expense.note || '-' }}</td>
          <td class="actions">
            <button class="btn-edit" @click="handleEdit(expense)">編輯</button>
            <button class="btn-delete" @click="handleDelete(expense.id)">刪除</button>
          </td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="text-align: right; font-weight: bold;">小計:</td>
          <td class="amount" style="font-weight: bold;">${{ totalAmount }}</td>
          <td colspan="2"></td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="selectedDate" class="empty-state">
      <p>該日期還沒有花費紀錄</p>
      <button class="btn-add" @click="handleAddNew">+ 新增花費</button>
    </div>

    <div v-else class="empty-state">
      <p>請從左邊日曆選擇日期</p>
    </div>

    <!-- 編輯/新增 Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditing ? '編輯花費' : '新增花費' }}</h3>
          <button class="btn-close" @click="closeModal">✕</button>
        </div>

        <div class="form-group">
          <label>類別</label>
          <input v-model="form.category" type="text" placeholder="例: 食物、交通" />
        </div>

        <div class="form-group">
          <label>人員</label>
          <select v-model="form.role">
            <option value="husband">丈夫</option>
            <option value="wife">妻子</option>
          </select>
        </div>

        <div class="form-group">
          <label>金額</label>
          <input v-model.number="form.amount" type="number" placeholder="0" min="0" step="0.01" />
        </div>

        <div class="form-group">
          <label>備註</label>
          <input v-model="form.note" type="text" placeholder="可選" />
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-submit" @click="handleSave">{{ isEditing ? '更新' : '新增' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBudgetStore } from '@/stores/budgetStore'

const props = defineProps({
  selectedDate: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['addExpense'])

const store = useBudgetStore()
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  category: '',
  role: 'husband',
  amount: 0,
  note: ''
})

const expenses = computed(() => {
  if (!props.selectedDate) return []
  return store.records.filter(r => r.date === props.selectedDate)
})

const totalAmount = computed(() => {
  return expenses.value.reduce((sum, exp) => sum + exp.amount, 0)
})

const handleAddNew = () => {
  isEditing.value = false
  editingId.value = null
  form.value = {
    category: '',
    role: 'husband',
    amount: 0,
    note: ''
  }
  showModal.value = true
}

const handleEdit = (expense) => {
  isEditing.value = true
  editingId.value = expense.id
  form.value = { ...expense }
  showModal.value = true
}

const handleSave = () => {
  if (!form.value.category || form.value.amount <= 0) {
    alert('請輸入類別和金額')
    return
  }

  if (isEditing.value) {
    store.updateRecord(editingId.value, form.value)
  } else {
    store.addRecord({
      date: props.selectedDate,
      ...form.value
    })
  }

  emit('addExpense')
  closeModal()
}

const handleDelete = (id) => {
  if (confirm('確認刪除此項花費嗎？')) {
    store.deleteRecord(id)
  }
}

const closeModal = () => {
  showModal.value = false
  isEditing.value = false
  editingId.value = null
}
</script>

<style scoped>
.expense-table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.table-header h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.btn-add {
  padding: 8px 16px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background-color: #059669;
}

.expense-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.expense-table thead {
  background-color: #f3f4f6;
  position: sticky;
  top: 0;
}

.expense-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.expense-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  color: #111827;
}

.expense-table tbody tr:hover {
  background-color: #f9fafb;
}

.amount {
  font-weight: 600;
  color: #1f2937;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-edit {
  background-color: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}

.total-row {
  background-color: #f0fdf4;
  font-weight: 600;
  border-top: 2px solid #e5e7eb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 20px;
  color: #6b7280;
  text-align: center;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
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
  font-size: 18px;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #1f2937;
}

.form-group {
  padding: 15px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-cancel,
.btn-submit {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background-color: #e5e7eb;
}

.btn-submit {
  background-color: #10b981;
  color: white;
}

.btn-submit:hover {
  background-color: #059669;
}
</style>
