<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { formatMonth } from '../utils/date'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n'

const store = useBudgetStore()
const { t, locale } = useI18n()
const currentMonth = formatMonth(new Date())

const currentMonthTotal = computed(() => {
  return store.expenses
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
})

const activeMembers = computed(() => store.members.length)

const localeOptions = [
  { code: 'zh-TW', label: '繁中' },
  { code: 'en', label: 'EN' }
]

const changeLocale = (value) => {
  if (locale.value === value) return
  setLocale(value)
}
</script>

<template>
  <header class="mx-auto max-w-6xl px-4 pt-8 lg:px-6">
    <div class="section-card rounded-3xl px-6 py-6">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="font-display text-3xl text-slate-100">{{ t('app.title') }}</p>
          <p class="mt-2 text-sm text-slate-400">
            {{ t('app.subtitle') }}
          </p>
          <nav class="mt-4 flex flex-wrap gap-2 text-sm">
            <RouterLink
              to="/"
              class="rounded-full border border-slate-700/70 bg-slate-950/60 px-4 py-1 text-slate-300 transition hover:border-slate-400/80 hover:text-slate-100"
              exact-active-class="border-sky-400/80 bg-sky-400/20 text-sky-200"
            >
              {{ t('nav.home') }}
            </RouterLink>
            <RouterLink
              to="/setting"
              class="rounded-full border border-slate-700/70 bg-slate-950/60 px-4 py-1 text-slate-300 transition hover:border-slate-400/80 hover:text-slate-100"
              exact-active-class="border-sky-400/80 bg-sky-400/20 text-sky-200"
            >
              {{ t('nav.setting') }}
            </RouterLink>
          </nav>
        </div>
        <div class="flex flex-col gap-4 lg:items-end">
          <div class="flex items-center gap-2 text-xs">
            <button
              v-for="item in localeOptions"
              :key="item.code"
              class="rounded-full border px-3 py-1 transition"
              :class="
                locale === item.code
                  ? 'border-sky-400/80 bg-sky-400/20 text-sky-200'
                  : 'border-slate-700/70 bg-slate-950/60 text-slate-400'
              "
              type="button"
              @click="changeLocale(item.code)"
            >
              {{ item.label }}
            </button>
          </div>
          <div class="flex flex-wrap gap-4">
            <div class="rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('summary.thisMonth') }}</p>
              <p class="mt-1 text-lg font-semibold text-sky-300">
                NT$ {{ currentMonthTotal.toLocaleString() }}
              </p>
            </div>
            <div class="rounded-2xl border border-slate-700/60 bg-slate-950/60 px-4 py-3">
              <p class="text-xs uppercase tracking-[0.2em] text-slate-500">{{ t('summary.members') }}</p>
              <p class="mt-1 text-lg font-semibold text-amber-300">
                {{ t('summary.active', { count: activeMembers }) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
</style>
