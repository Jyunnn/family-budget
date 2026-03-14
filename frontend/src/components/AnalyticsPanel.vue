<script setup>
import { computed } from 'vue'
import SectionCard from './SectionCard.vue'
import CategoryChart from './CategoryChart.vue'
import { useBudgetStore } from '../stores/budget'
import { getQuarter, parseMonth } from '../utils/date'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

const years = Array.from({ length: 10 }, (_, index) => 2025 + index)
const quarterOptions = computed(() => [
  { value: 'Q1', label: t('analytics.q1') },
  { value: 'Q2', label: t('analytics.q2') },
  { value: 'Q3', label: t('analytics.q3') },
  { value: 'Q4', label: t('analytics.q4') }
])

const periodType = computed({
  get: () => store.periodFilter.type,
  set: (value) => {
    const now = new Date()
    if (value === 'month') {
      store.setPeriodFilter('month', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
      return
    }
    if (value === 'quarter') {
      store.setPeriodFilter('quarter', `${now.getFullYear()}-Q${getQuarter(now.getMonth())}`)
      return
    }
    store.setPeriodFilter('year', `${now.getFullYear()}`)
  }
})

const monthValue = computed({
  get: () => store.periodFilter.value,
  set: (value) => store.setPeriodFilter('month', value)
})

const quarterYear = computed({
  get: () => Number(store.periodFilter.value.split('-Q')[0] || years[0]),
  set: (value) => {
    const quarter = store.periodFilter.value.split('-Q')[1] || '1'
    store.setPeriodFilter('quarter', `${value}-Q${quarter}`)
  }
})

const quarterValue = computed({
  get: () => `Q${store.periodFilter.value.split('-Q')[1] || '1'}`,
  set: (value) => store.setPeriodFilter('quarter', `${quarterYear.value}-${value}`)
})

const yearValue = computed({
  get: () => Number(store.periodFilter.value),
  set: (value) => store.setPeriodFilter('year', `${value}`)
})

const range = computed(() => {
  const filter = store.periodFilter
  if (filter.type === 'month') {
    const { year, month } = parseMonth(filter.value)
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0)
    }
  }
  if (filter.type === 'quarter') {
    const [yearStr, quarterStr] = filter.value.split('-Q')
    const year = Number(yearStr)
    const quarterIndex = Number(quarterStr) - 1
    const startMonth = quarterIndex * 3
    return {
      start: new Date(year, startMonth, 1),
      end: new Date(year, startMonth + 3, 0)
    }
  }
  const year = Number(filter.value)
  return {
    start: new Date(year, 0, 1),
    end: new Date(year, 11, 31)
  }
})

const categorySummary = computed(() => {
  const totals = new Map(store.categories.map((item) => [item.id, { name: item.name, amount: 0 }]))
  // Aggregate expenses within the selected date range.
  store.expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date)
    if (expenseDate >= range.value.start && expenseDate <= range.value.end) {
      const entry = totals.get(expense.categoryId) || { name: 'Other', amount: 0 }
      entry.amount += Number(expense.amount || 0)
      totals.set(expense.categoryId, entry)
    }
  })
  return Array.from(totals.values()).filter((item) => item.amount > 0)
})

const chartData = computed(() => {
  const labels = categorySummary.value.map((item) => item.name)
  const values = categorySummary.value.map((item) => item.amount)
  const total = values.reduce((sum, value) => sum + value, 0)
  return { labels, values, total }
})
</script>

<template>
  <SectionCard
    :title="t('analytics.title')"
    :subtitle="t('analytics.subtitle')"
    icon="fa-solid fa-chart-pie"
  >
    <div class="grid gap-3 md:grid-cols-3">
      <label class="text-sm text-slate-400">
        {{ t('analytics.period') }}
        <select
          v-model="periodType"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
        >
          <option value="month">{{ t('analytics.month') }}</option>
          <option value="quarter">{{ t('analytics.quarter') }}</option>
          <option value="year">{{ t('analytics.year') }}</option>
        </select>
      </label>
      <label v-if="periodType === 'month'" class="text-sm text-slate-400">
        {{ t('analytics.month') }}
        <input
          v-model="monthValue"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          type="month"
          min="2025-01"
          max="2034-12"
        />
      </label>
      <div v-if="periodType === 'quarter'" class="flex gap-2">
        <label class="flex-1 text-sm text-slate-400">
          {{ t('analytics.year') }}
          <select
            v-model="quarterYear"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </label>
        <label class="flex-1 text-sm text-slate-400">
          {{ t('analytics.quarter') }}
          <select
            v-model="quarterValue"
            class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
          >
            <option v-for="quarter in quarterOptions" :key="quarter.value" :value="quarter.value">
              {{ quarter.label }}
            </option>
          </select>
        </label>
      </div>
      <label v-if="periodType === 'year'" class="text-sm text-slate-400">
        {{ t('analytics.year') }}
        <select
          v-model="yearValue"
          class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
        >
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
      </label>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <CategoryChart :labels="chartData.labels" :values="chartData.values" />
      <div class="space-y-3">
        <div
          v-for="item in categorySummary"
          :key="item.name"
          class="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-sm"
        >
          <span class="text-slate-300">{{ item.name }}</span>
          <span class="font-semibold text-sky-200">NT$ {{ item.amount.toLocaleString() }}</span>
        </div>
        <div class="rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 py-2 text-sm">
          <span class="text-slate-400">{{ t('analytics.total') }}</span>
          <p class="mt-1 text-lg font-semibold text-amber-200">
            NT$ {{ chartData.total.toLocaleString() }}
          </p>
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
</style>
