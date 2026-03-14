<script setup>
import { ref, computed } from 'vue'
import SectionCard from './SectionCard.vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

const filterType = ref('ALL')

const filteredTransactions = computed(() => {
  if (filterType.value === 'ALL') {
    return store.transactions
  }
  return store.transactions.filter((trx) => trx.type === filterType.value)
})

const removeTransaction = async (id) => {
  if (!confirm(t('confirm.removeTransaction'))) return
  await store.removeTransaction(id)
}
</script>

<template>
  <SectionCard
    :title="t('account.transactions.title')"
    icon="fa-solid fa-clock-rotate-left"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg px-3 py-1 text-xs transition"
          :class="filterType === 'ALL' ? 'bg-sky-500/80 text-slate-900' : 'border border-slate-700/70 bg-slate-900/70 text-slate-200'"
          type="button"
          @click="filterType = 'ALL'"
        >
          {{ t('account.transactions.all') }}
        </button>
        <button
          class="rounded-lg px-3 py-1 text-xs transition"
          :class="filterType === 'DEPOSIT' ? 'bg-emerald-500/80 text-slate-900' : 'border border-slate-700/70 bg-slate-900/70 text-slate-200'"
          type="button"
          @click="filterType = 'DEPOSIT'"
        >
          {{ t('account.transactions.deposit') }}
        </button>
        <button
          class="rounded-lg px-3 py-1 text-xs transition"
          :class="filterType === 'PAYMENT' ? 'bg-rose-500/80 text-slate-900' : 'border border-slate-700/70 bg-slate-900/70 text-slate-200'"
          type="button"
          @click="filterType = 'PAYMENT'"
        >
          {{ t('account.transactions.payment') }}
        </button>
      </div>
    </div>

    <div v-if="filteredTransactions.length === 0" class="mt-4 text-sm text-slate-500">
      {{ t('account.transactions.empty') }}
    </div>
    <div v-else class="mt-4 space-y-2">
      <div
        v-for="trx in filteredTransactions"
        :key="trx.id"
        class="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-3"
      >
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span
              class="rounded px-2 py-0.5 text-xs font-semibold"
              :class="trx.type === 'DEPOSIT' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'"
            >
              {{ trx.type === 'DEPOSIT' ? t('account.type.deposit') : t('account.type.payment') }}
            </span>
            <span class="text-sm text-slate-400">{{ trx.date }}</span>
          </div>
          <div class="mt-1 flex items-center gap-2">
            <span v-if="trx.type === 'DEPOSIT'" class="text-sm text-slate-200">
              {{ trx.memberName || '-' }}
            </span>
            <span v-else class="text-sm text-slate-200">
              {{ trx.categoryName || '-' }}
            </span>
          </div>
          <p v-if="trx.note || trx.expenseNote" class="mt-1 text-xs text-slate-500">
            {{ trx.note || trx.expenseNote }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="text-sm font-semibold"
            :class="trx.type === 'DEPOSIT' ? 'text-emerald-200' : 'text-rose-200'"
          >
            {{ trx.type === 'DEPOSIT' ? '+' : '-' }}NT$ {{ trx.amount.toLocaleString() }}
          </span>
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200 transition hover:bg-rose-500/20 hover:text-rose-200"
            type="button"
            @click="removeTransaction(trx.id)"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </SectionCard>
</template>

<style scoped>
</style>
