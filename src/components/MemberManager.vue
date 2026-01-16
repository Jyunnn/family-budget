<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

const form = ref({ name: '', monthlyContribution: '' })
const editingId = ref(null)
const errorMessage = ref('')

const startEdit = (member) => {
  editingId.value = member.id
  form.value = {
    name: member.name,
    monthlyContribution: member.monthlyContribution
  }
}

const resetForm = () => {
  form.value = { name: '', monthlyContribution: '' }
  editingId.value = null
  errorMessage.value = ''
}

const saveMember = async () => {
  errorMessage.value = ''
  if (!form.value.name || !form.value.monthlyContribution) {
    errorMessage.value = t('member.requiredError')
    return
  }
  if (Number(form.value.monthlyContribution) <= 0) {
    errorMessage.value = t('member.amountError')
    return
  }
  if (editingId.value) {
    const result = await store.updateMember(editingId.value, {
      name: form.value.name,
      monthlyContribution: Number(form.value.monthlyContribution)
    })
    if (!result.ok) {
      errorMessage.value = result.message || t('member.requiredError')
      return
    }
  } else {
    const result = await store.addMember({
      name: form.value.name,
      monthlyContribution: Number(form.value.monthlyContribution)
    })
    if (!result.ok) {
      errorMessage.value = result.message || t('member.requiredError')
      return
    }
  }
  resetForm()
}

const removeMember = async (memberId) => {
  if (!confirm(t('confirm.removeMember'))) return
  const result = await store.removeMember(memberId)
  if (!result.removed) {
    errorMessage.value = result.message || t('member.removeBlocked')
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-slate-100">{{ t('settings.membersTitle') }}</p>
      <button
        class="rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs text-slate-200"
        type="button"
        @click="resetForm"
      >
        {{ t('actions.clear') }}
      </button>
    </div>
    <form class="mt-3 grid gap-3" @submit.prevent="saveMember">
      <input
        v-model="form.name"
        class="rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
        type="text"
        :placeholder="t('member.namePlaceholder')"
      />
      <input
        v-model="form.monthlyContribution"
        class="rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
        type="number"
        min="1"
        step="1"
        :placeholder="t('member.contributionPlaceholder')"
      />
      <button
        class="rounded-xl bg-amber-400/90 px-3 py-2 text-sm font-semibold text-slate-900"
        type="submit"
      >
        {{ editingId ? t('member.update') : t('member.add') }}
      </button>
      <p v-if="errorMessage" class="text-xs text-amber-200">{{ errorMessage }}</p>
    </form>

    <div class="mt-4 space-y-2">
      <div
        v-for="member in store.members"
        :key="member.id"
        class="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2"
      >
        <div>
          <p class="text-sm font-semibold text-slate-100">{{ member.name }}</p>
          <p class="text-xs text-slate-500">
            NT$ {{ member.monthlyContribution.toLocaleString() }} {{ t('member.perMonth') }}
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
            type="button"
            @click="startEdit(member)"
          >
            {{ t('actions.edit') }}
          </button>
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
            type="button"
            @click="removeMember(member.id)"
          >
            {{ t('actions.remove') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
