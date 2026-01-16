<script setup>
import { ref, computed } from 'vue'
import { formatDate } from '../utils/date'
import SectionCard from './SectionCard.vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

const form = ref({
  date: formatDate(new Date()),
  memberId: '',
  amount: '',
  note: ''
})

const errorMessage = ref('')
const isSaving = ref(false)

const memberOptions = computed(() => store.members)

const resetForm = () => {
  form.value = {
    date: formatDate(new Date()),
    memberId: '',
    amount: '',
    note: ''
  }
  errorMessage.value = ''
}

const submitDeposit = async () => {
  errorMessage.value = ''
  if (!form.value.date || !form.value.memberId || !form.value.amount) {
    errorMessage.value = t('expenseForm.requiredError')
    return
  }
  if (Number(form.value.amount) <= 0) {
    errorMessage.value = t('expenseForm.amountError')
    return
  }

  try {
    isSaving.value = true
    const result = await store.addDeposit({
      date: form.value.date,
      memberId: form.value.memberId,
      amount: Number(form.value.amount),
      note: form.value.note
    })
    if (!result.ok) {
      errorMessage.value = result.message || t('account.depositForm.saveError')
      return
    }
    resetForm()
  } catch (err) {
    errorMessage.value = t('account.depositForm.saveError')
    console.error('Deposit save error:', err)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <SectionCard
    :title="t('account.depositForm.title')"
    icon="fa-solid fa-hand-holding-dollar"
  >
    <form class="space-y-4" @submit.prevent="submitDeposit">
      <label class="text-sm text-slate-400">
        {{ t('account.depositForm.date') }}
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
        {{ t('account.depositForm.member') }}
        <select
          v-model="form.memberId"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          required
        >
          <option value="" disabled>{{ t('account.depositForm.selectMember') }}</option>
          <option v-for="member in memberOptions" :key="member.id" :value="member.id">
            {{ member.name }} (NT$ {{ member.monthlyContribution.toLocaleString() }})
          </option>
        </select>
      </label>
      <label class="text-sm text-slate-400">
        {{ t('account.depositForm.amount') }}
        <input
          v-model="form.amount"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          type="number"
          min="1"
          step="1"
          required
        />
      </label>
      <label class="text-sm text-slate-400">
        {{ t('account.depositForm.note') }}
        <input
          v-model="form.note"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          type="text"
          :placeholder="t('account.depositForm.notePlaceholder')"
        />
      </label>
      <p v-if="errorMessage" class="text-sm text-amber-200">{{ errorMessage }}</p>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        :disabled="isSaving || store.members.length === 0"
      >
        <i class="fa-solid fa-plus"></i>
        <span>{{ isSaving ? t('account.depositForm.saving') : t('account.depositForm.save') }}</span>
      </button>
    </form>
  </SectionCard>
</template>

<style scoped>
</style>
