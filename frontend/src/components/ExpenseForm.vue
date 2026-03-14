<script setup>
import { computed, ref, watch } from 'vue'
import SectionCard from './SectionCard.vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

  const form = ref({
    date: store.selectedDate,
    paymentSource: 'member',
    memberId: '',
    categoryId: '',
    amount: '',
    note: ''
  })

  const errorMessage = ref('')
  const isSaving = ref(false)

  const memberOptions = computed(() => store.members)
  const categoryOptions = computed(() => store.activeCategories)
  const activeAccount = computed(() => store.activeAccount)

  const calculateAmount = (value) => {
    if (!value) return ''
    const parts = value.split('+').map(s => s.trim()).filter(Boolean)
    if (parts.length <= 1) return value
    const sum = parts.reduce((acc, n) => acc + Number(n), 0)
    return isNaN(sum) ? value : String(sum)
  }

  const onAmountBlur = () => {
    form.value.amount = calculateAmount(form.value.amount)
  }

  const resetForm = () => {
    form.value = {
      date: store.selectedDate,
      paymentSource: 'member',
      memberId: '',
      categoryId: '',
      amount: '',
      note: ''
    }
  }

  const submitExpense = async () => {
    errorMessage.value = ''

    const isFromHousehold = form.value.paymentSource === 'household'

    if (!form.value.date || !form.value.categoryId || !form.value.amount) {
      errorMessage.value = t('expenseForm.requiredError')
      return
    }

    if (!isFromHousehold && !form.value.memberId) {
      errorMessage.value = t('expenseForm.requiredError')
      return
    }

    if (isFromHousehold && !activeAccount.value) {
      errorMessage.value = 'No active household account found.'
      return
    }

    if (Number(form.value.amount) <= 0) {
      errorMessage.value = t('expenseForm.amountError')
      return
    }

    try {
      isSaving.value = true
      const result = await store.addExpense({
        date: form.value.date,
        memberId: isFromHousehold ? null : form.value.memberId,
        categoryId: form.value.categoryId,
        amount: Number(form.value.amount),
        note: form.value.note,
        isFromHousehold,
        householdAccountId: isFromHousehold ? activeAccount.value.id : null
      })
      if (!result.ok) {
        errorMessage.value = result.message || t('expenseForm.saveError')
        return
      }
      store.setSelectedDate(form.value.date)
      resetForm()
    } catch (err) {
      errorMessage.value = t('expenseForm.saveError')
      console.error('Expense save error:', err)
    } finally {
      isSaving.value = false
    }
  }

watch(
  () => store.selectedDate,
  (value) => {
    if (!form.value.date || form.value.date === store.selectedDate) {
      form.value.date = value
    }
  }
)
</script>

<template>
  <SectionCard
    :title="t('expenseForm.title')"
    :subtitle="t('expenseForm.subtitle')"
    icon="fa-solid fa-pen-to-square"
  >
    <form class="space-y-4" @submit.prevent="submitExpense">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm text-slate-400">
          {{ t('expenseForm.date') }}
          <input
            v-model="form.date"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            type="date"
            min="2025-01-01"
            max="2034-12-31"
            required
          />
        </label>
        <label class="text-sm text-slate-400">
          {{ t('expenseForm.paymentSource') }}
          <select
            v-model="form.paymentSource"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            required
          >
            <option value="member">{{ t('account.memberAccount') }}</option>
            <option v-if="activeAccount" value="household">{{ t('account.householdAccount') }}</option>
          </select>
        </label>
        <label v-if="form.paymentSource === 'member'" class="text-sm text-slate-400">
          {{ t('expenseForm.member') }}
          <select
            v-model="form.memberId"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            required
          >
            <option value="" disabled>{{ t('expenseForm.selectMember') }}</option>
            <option v-for="member in memberOptions" :key="member.id" :value="member.id">
              {{ member.name }} (NT$ {{ member.monthlyContribution.toLocaleString() }})
            </option>
          </select>
        </label>
        <label v-else class="text-sm text-slate-400">
          {{ t('expenseForm.category') }}
          <select
            v-model="form.categoryId"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            required
          >
            <option value="" disabled>{{ t('expenseForm.selectCategory') }}</option>
            <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label :class="form.paymentSource === 'member' ? 'text-sm text-slate-400' : 'md:col-span-2 text-sm text-slate-400'">
          {{ t('expenseForm.category') }}
          <select
            v-if="form.paymentSource === 'member'"
            v-model="form.categoryId"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            required
          >
            <option value="" disabled>{{ t('expenseForm.selectCategory') }}</option>
            <option v-for="category in categoryOptions" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </label>
        <label class="text-sm text-slate-400">
          {{ t('expenseForm.amount') }}
          <input
            v-model="form.amount"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
            type="text"
            inputmode="numeric"
            @blur="onAmountBlur"
            required
          />
        </label>
      </div>
      <label class="text-sm text-slate-400">
        {{ t('expenseForm.note') }}
        <input
          v-model="form.note"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          type="text"
          :placeholder="t('expenseForm.notePlaceholder')"
        />
      </label>
      <p v-if="errorMessage" class="text-sm text-amber-200">{{ errorMessage }}</p>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-sky-500/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="isSaving || store.members.length === 0"
      >
        <i class="fa-solid fa-plus"></i>
        <span>{{ isSaving ? t('expenseForm.saving') : t('expenseForm.save') }}</span>
      </button>
    </form>
  </SectionCard>
</template>

<style scoped>
</style>
