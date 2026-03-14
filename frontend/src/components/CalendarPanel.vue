<script setup>
import { computed, ref, watch } from 'vue'
import SectionCard from './SectionCard.vue'
import DayExpenseList from './DayExpenseList.vue'
import { useBudgetStore } from '../stores/budget'
import { formatDate, formatMonth, parseMonth, addMonths } from '../utils/date'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t, locale } = useI18n()

const minMonth = { year: 2025, month: 0 }
const maxMonth = { year: 2034, month: 11 }

const today = new Date()
const initialMonth = formatMonth(today)
const visibleMonth = ref(initialMonth)

const years = Array.from({ length: 10 }, (_, index) => 2025 + index)

const currentMonth = computed(() => parseMonth(visibleMonth.value))

const monthOptions = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long' })
  return Array.from({ length: 12 }, (_, index) => formatter.format(new Date(2025, index, 1)))
})

const monthLabel = computed(() => {
  const { year, month } = currentMonth.value
  const formatter = new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' })
  return formatter.format(new Date(year, month, 1))
})

const weekDays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
  const base = new Date(2025, 0, 5)
  return Array.from({ length: 7 }, (_, index) =>
    formatter.format(new Date(base.getFullYear(), base.getMonth(), base.getDate() + index))
  )
})

const calendarCells = computed(() => {
  const { year, month } = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const startingWeekday = firstDay.getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startingWeekday; i += 1) {
    cells.push({ isPadding: true, label: '', key: `pad-${year}-${month}-${i}` })
  }
  for (let day = 1; day <= totalDays; day += 1) {
    const dateValue = formatDate(new Date(year, month, day))
    cells.push({
      isPadding: false,
      label: day,
      date: dateValue,
      key: `day-${dateValue}`
    })
  }
  return cells
})

const dailyTotals = computed(() => {
  const map = new Map()
  store.expenses
    .filter((expense) => expense.date.startsWith(visibleMonth.value))
    .forEach((expense) => {
      const current = map.get(expense.date) || 0
      map.set(expense.date, current + Number(expense.amount || 0))
    })
  return map
})

const selectedDayExpenses = computed(() => {
  const membersMap = new Map(store.members.map((item) => [item.id, item.name]))
  const categoriesMap = new Map(store.categories.map((item) => [item.id, item.name]))
  return store.expenses
    .filter((expense) => expense.date === store.selectedDate)
    .map((expense) => ({
      id: expense.id,
      date: expense.date,
      memberId: expense.memberId,
      categoryId: expense.categoryId,
      memberName: expense.isFromHousehold ? t('account.householdAccount') : (membersMap.get(expense.memberId) || 'Unknown'),
      categoryName: categoriesMap.get(expense.categoryId) || 'Other',
      amount: expense.amount,
      note: expense.note
    }))
})

const goToMonth = (delta) => {
  const current = parseMonth(visibleMonth.value)
  const nextDate = addMonths(new Date(current.year, current.month, 1), delta)
  const nextValue = formatMonth(nextDate)
  const { year, month } = parseMonth(nextValue)

  if (year < minMonth.year || (year === minMonth.year && month < minMonth.month)) {
    return
  }
  if (year > maxMonth.year || (year === maxMonth.year && month > maxMonth.month)) {
    return
  }
  visibleMonth.value = nextValue
}

const jumpToMonth = () => {
  const { year, month } = currentMonth.value
  if (year < minMonth.year || (year === minMonth.year && month < minMonth.month)) {
    visibleMonth.value = '2025-01'
    return
  }
  if (year > maxMonth.year || (year === maxMonth.year && month > maxMonth.month)) {
    visibleMonth.value = '2034-12'
  }
}

watch(visibleMonth, jumpToMonth)

watch(
  () => store.selectedDate,
  (value) => {
    if (value) {
      visibleMonth.value = value.slice(0, 7)
    }
  }
)
</script>

<template>
  <SectionCard
    :title="t('calendar.title')"
    :subtitle="t('calendar.subtitle')"
    icon="fa-regular fa-calendar"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button
          class="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
          type="button"
          @click="goToMonth(-1)"
        >
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <button
          class="rounded-xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-sm text-slate-200"
          type="button"
          @click="goToMonth(1)"
        >
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <select
          v-model="visibleMonth"
          class="rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
        >
          <option v-for="year in years" :key="year" :value="`${year}-${'01'}`" disabled>
            {{ year }}
          </option>
          <template v-for="year in years" :key="`${year}-months`">
            <option
              v-for="(monthName, index) in monthOptions"
              :key="`${year}-${index}`"
              :value="`${year}-${String(index + 1).padStart(2, '0')}`"
            >
              {{ monthName }} {{ year }}
            </option>
          </template>
        </select>
        <span class="text-sm text-slate-400">{{ monthLabel }}</span>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-7 gap-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
      >
        {{ day }}
      </div>
      <button
        v-for="cell in calendarCells"
        :key="cell.key"
        class="min-h-[80px] rounded-2xl border border-slate-800/80 bg-slate-950/40 px-2 py-2 text-left text-sm text-slate-100 transition hover:border-sky-400/60"
        :class="{
          'border-sky-400/80 bg-slate-900/80': cell.date === store.selectedDate,
          'opacity-40 hover:border-slate-800/80': cell.isPadding
        }"
        type="button"
        :disabled="cell.isPadding"
        @click="store.setSelectedDate(cell.date)"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">{{ cell.label }}</span>
          <span
            v-if="cell.date && dailyTotals.get(cell.date)"
            class="rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-semibold text-sky-200"
          >
            NT$ {{ dailyTotals.get(cell.date).toLocaleString() }}
          </span>
        </div>
      </button>
    </div>

    <DayExpenseList :date-label="store.selectedDate" :items="selectedDayExpenses" />
  </SectionCard>
</template>

<style scoped>
</style>
