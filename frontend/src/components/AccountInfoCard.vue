<script setup>
import { computed, ref } from 'vue'
import SectionCard from './SectionCard.vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

const account = computed(() => store.activeAccount)

const totalDeposit = computed(() => {
  return store.transactions
    .filter(trx => trx.type === 'DEPOSIT')
    .reduce((sum, trx) => sum + trx.amount, 0)
})

const totalPayment = computed(() => {
  return store.transactions
    .filter(trx => trx.type === 'PAYMENT')
    .reduce((sum, trx) => sum + trx.amount, 0)
})

const isEditing = ref(false)
const editForm = ref({
  name: '',
  bankName: '',
  accountNumber: ''
})

const startEdit = () => {
  if (account.value) {
    editForm.value = {
      name: account.value.name,
      bankName: account.value.bankName || '',
      accountNumber: account.value.accountNumber || ''
    }
    isEditing.value = true
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editForm.value = {
    name: '',
    bankName: '',
    accountNumber: ''
  }
}

const saveEdit = async () => {
  if (!account.value) return

  const result = await store.updateAccount(account.value.id, {
    name: editForm.value.name,
    bankName: editForm.value.bankName || null,
    accountNumber: editForm.value.accountNumber || null
  })

  if (result.ok) {
    isEditing.value = false
  }
}
</script>

<template>
  <SectionCard
    :title="t('account.title')"
    :subtitle="t('account.subtitle')"
    icon="fa-solid fa-wallet"
  >
    <div v-if="!account" class="text-sm text-slate-500">
      No account found.
    </div>
    <template v-else>
      <div v-if="!isEditing" class="space-y-4">
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
            {{ t('account.bankName') }}
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-100">
            {{ account.bankName || '-' }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
            {{ t('account.accountNumber') }}
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-100">
            {{ account.accountNumber || '-' }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
            {{ t('account.currentBalance') }}
          </p>
          <p class="mt-2 text-2xl font-bold text-sky-200">
            NT$ {{ account.currentBalance.toLocaleString() }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              {{ t('account.totalDeposit') }}
            </p>
            <p class="mt-1 text-sm font-semibold text-emerald-200">
              NT$ {{ totalDeposit.toLocaleString() }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-800/80 bg-slate-950/50 px-3 py-2">
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              {{ t('account.totalPayment') }}
            </p>
            <p class="mt-1 text-sm font-semibold text-rose-200">
              NT$ {{ totalPayment.toLocaleString() }}
            </p>
          </div>
        </div>
        <button
          class="w-full rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs text-slate-200"
          type="button"
          @click="startEdit"
        >
          {{ t('account.editAccount') }}
        </button>
      </div>
      <form v-else class="space-y-3" @submit.prevent="saveEdit">
        <div>
          <label class="text-sm text-slate-400">
            {{ t('account.bankName') }}
            <input
              v-model="editForm.bankName"
              class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
              type="text"
            />
          </label>
        </div>
        <div>
          <label class="text-sm text-slate-400">
            {{ t('account.accountNumber') }}
            <input
              v-model="editForm.accountNumber"
              class="mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
              type="text"
            />
          </label>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-xs text-slate-200"
            type="button"
            @click="cancelEdit"
          >
            {{ t('actions.cancel') }}
          </button>
          <button
            class="rounded-lg bg-sky-500/80 px-3 py-2 text-xs font-semibold text-slate-900"
            type="submit"
          >
            {{ t('actions.save') }}
          </button>
        </div>
      </form>
    </template>
  </SectionCard>
</template>

<style scoped>
</style>
