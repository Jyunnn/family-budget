<script setup>
import { computed, ref } from 'vue'
import SectionCard from './SectionCard.vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t, locale } = useI18n()

const targetMonth = ref(new Date().toISOString().slice(0, 7))

const previousMonth = (value) => {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 2, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const formatMonthLabel = (value) => {
  const [year, month] = value.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' })
  return formatter.format(date)
}

const remittanceList = computed(() => {
  const prevMonth = previousMonth(targetMonth.value)
  return store.members.map((member) => {
    const paidAdvance = store.expenses
      .filter((expense) => expense.memberId === member.id && expense.date.startsWith(prevMonth))
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
    const due = Number(member.monthlyContribution || 0) - paidAdvance
    return {
      id: member.id,
      name: member.name,
      paidAdvance,
      nextMonthDue: due > 0 ? due : 0,
      transferToMember: due < 0 ? Math.abs(due) : 0
    }
  })
})
</script>

<template>
  <SectionCard
    :title="t('remittance.title')"
    :subtitle="t('remittance.subtitle')"
    icon="fa-solid fa-coins"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <label class="text-sm text-slate-400">
        {{ t('remittance.targetMonth') }}
        <input
          v-model="targetMonth"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          type="month"
          min="2025-01"
          max="2034-12"
        />
      </label>
      <div class="text-xs uppercase tracking-[0.2em] text-slate-500">
        {{ t('remittance.basedOn', { month: formatMonthLabel(previousMonth(targetMonth)) }) }}
      </div>
    </div>

    <div v-if="store.members.length === 0" class="mt-4 text-sm text-slate-500">
      {{ t('remittance.empty') }}
    </div>
    <div v-else class="mt-4 space-y-3">
      <div
        v-for="item in remittanceList"
        :key="item.id"
        class="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-4"
      >
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-100">{{ item.name }}</p>
          <span class="text-xs text-slate-500">
            {{ t('remittance.advance') }}: NT$ {{ item.paidAdvance.toLocaleString() }}
          </span>
        </div>
        <div class="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div class="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              {{ t('remittance.nextDeposit') }}
            </p>
            <p class="mt-1 font-semibold text-sky-200">
              NT$ {{ item.nextMonthDue.toLocaleString() }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              {{ t('remittance.transferBack') }}
            </p>
            <p class="mt-1 font-semibold text-amber-200">
              NT$ {{ item.transferToMember.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
</style>
