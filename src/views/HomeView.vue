<script setup>
import HeaderBar from '../components/HeaderBar.vue'
import CalendarPanel from '../components/CalendarPanel.vue'
import ExpenseForm from '../components/ExpenseForm.vue'
import AnalyticsPanel from '../components/AnalyticsPanel.vue'
import RemittancePanel from '../components/RemittancePanel.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()
</script>

<template>
  <div class="mesh-grid min-h-screen">
    <HeaderBar />
    <main class="mx-auto max-w-6xl px-4 pb-16 pt-6 lg:px-6">
      <div
        v-if="store.members.length === 0"
        class="mb-6 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-4 text-sm text-slate-200"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg text-sky-300">
            <i class="fa-solid fa-circle-info"></i>
          </span>
          <div>
            <p class="font-semibold text-slate-100">{{ t('alerts.setupTitle') }}</p>
            <p class="text-slate-400">{{ t('alerts.setupSubtitle') }}</p>
          </div>
        </div>
      </div>
      <div class="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div class="space-y-6">
          <CalendarPanel />
          <ExpenseForm />
        </div>
        <div class="space-y-6">
          <AnalyticsPanel />
          <RemittancePanel />
        </div>
      </div>
      <div class="mt-6">
        <SettingsPanel />
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
