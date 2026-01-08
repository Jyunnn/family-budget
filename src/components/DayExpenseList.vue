<script setup>
import { computed, ref } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  dateLabel: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
})

const store = useBudgetStore()
const { t } = useI18n()

const editingId = ref(null)
const isSaving = ref(false)
const errorMessage = ref('')
const form = ref({
  date: '',
  memberId: '',
  categoryId: '',
  amount: '',
  note: ''
})

const memberOptions = computed(() => store.members)
const categoryOptions = computed(() => store.categories)

const startEdit = (item) => {
  editingId.value = item.id
  errorMessage.value = ''
  form.value = {
    date: item.date,
    memberId: item.memberId,
    categoryId: item.categoryId,
    amount: item.amount,
    note: item.note || ''
  }
}

const cancelEdit = () => {
  editingId.value = null
  errorMessage.value = ''
}

const saveEdit = async () => {
  if (!editingId.value) return
  errorMessage.value = ''
  if (!form.value.date || !form.value.memberId || !form.value.categoryId || !form.value.amount) {
    errorMessage.value = t('expenseForm.requiredError')
    return
  }
  if (Number(form.value.amount) <= 0) {
    errorMessage.value = t('expenseForm.amountError')
    return
  }

  try {
    isSaving.value = true
    const result = await store.updateExpense(editingId.value, {
      date: form.value.date,
      memberId: form.value.memberId,
      categoryId: form.value.categoryId,
      amount: Number(form.value.amount),
      note: form.value.note
    })
    if (!result.ok) {
      errorMessage.value = result.message || t('expenseForm.updateError')
      return
    }
    store.setSelectedDate(form.value.date)
    cancelEdit()
  } catch (err) {
    errorMessage.value = t('expenseForm.updateError')
    console.error('Expense update error:', err)
  } finally {
    isSaving.value = false
  }
}

const removeExpense = async (expenseId) => {
  errorMessage.value = ''
  const result = await store.removeExpense(expenseId)
  if (!result.removed) {
    errorMessage.value = result.message || t('expenseForm.removeError')
    return
  }
  if (editingId.value === expenseId) {
    cancelEdit()
  }
}
</script>

<template>
  <div class="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-slate-100">{{ props.dateLabel }}</p>
      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
        {{ t('calendar.items', { count: props.items.length }) }}
      </p>
    </div>
    <div v-if="props.items.length === 0" class="mt-3 text-sm text-slate-500">
      {{ t('calendar.empty') }}
    </div>
    <div v-else class="mt-3 space-y-2">
      <div
        v-for="item in props.items"
        :key="item.id"
        class="flex flex-col gap-3 rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-slate-100">{{ item.categoryName }}</p>
            <p class="text-xs text-slate-500">{{ item.memberName }}</p>
            <p v-if="item.note" class="text-xs text-slate-400">{{ item.note }}</p>
          </div>
          <div class="flex items-center gap-3">
            <p class="text-sm font-semibold text-amber-200">NT$ {{ item.amount.toLocaleString() }}</p>
            <div class="flex items-center gap-2 text-xs">
              <button
                class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
                type="button"
                @click="startEdit(item)"
              >
                {{ t('actions.edit') }}
              </button>
              <button
                class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
                type="button"
                :disabled="isSaving"
                @click="removeExpense(item.id)"
              >
                {{ t('actions.remove') }}
              </button>
            </div>
          </div>
        </div>
        <div
          v-if="editingId === item.id"
          class="rounded-xl border border-slate-800/70 bg-slate-950/40 p-3"
        >
          <div class="grid gap-2 md:grid-cols-2">
            <label class="text-xs text-slate-400">
              {{ t('expenseForm.date') }}
              <input
                v-model="form.date"
                class="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
                type="date"
                min="2025-01-01"
                max="2034-12-31"
                required
              />
            </label>
            <label class="text-xs text-slate-400">
              {{ t('expenseForm.member') }}
              <select
                v-model="form.memberId"
                class="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
                required
              >
                <option value="" disabled>{{ t('expenseForm.selectMember') }}</option>
                <option v-for="member in memberOptions" :key="member.id" :value="member.id">
                  {{ member.name }}
                </option>
              </select>
            </label>
            <label class="text-xs text-slate-400">
              {{ t('expenseForm.category') }}
              <select
                v-model="form.categoryId"
                class="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
                required
              >
                <option value="" disabled>{{ t('expenseForm.selectCategory') }}</option>
                <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </label>
            <label class="text-xs text-slate-400">
              {{ t('expenseForm.amount') }}
              <input
                v-model="form.amount"
                class="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
                type="number"
                min="1"
                step="1"
                required
              />
            </label>
          </div>
          <label class="mt-2 block text-xs text-slate-400">
            {{ t('expenseForm.note') }}
            <input
              v-model="form.note"
              class="mt-1 w-full rounded-lg border border-slate-700/70 bg-slate-950/60 px-2 py-1 text-xs text-slate-100"
              type="text"
              :placeholder="t('expenseForm.notePlaceholder')"
            />
          </label>
          <div class="mt-3 flex items-center gap-2 text-xs">
            <button
              class="rounded-lg bg-sky-400/80 px-3 py-1 font-semibold text-slate-900"
              type="button"
              :disabled="isSaving"
              @click="saveEdit"
            >
              {{ isSaving ? t('expenseForm.saving') : t('expenseForm.save') }}
            </button>
            <button
              class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-3 py-1 text-slate-200"
              type="button"
              :disabled="isSaving"
              @click="cancelEdit"
            >
              {{ t('actions.clear') }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-if="errorMessage" class="mt-3 text-xs text-amber-200">{{ errorMessage }}</p>
  </div>
</template>

<style scoped>
</style>
