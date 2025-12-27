<script setup>
import { useI18n } from 'vue-i18n'

const props = defineProps({
  dateLabel: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
</script>

<template>
  <div class="mt-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-slate-100">{{ props.dateLabel }}</p>
      <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
        {{ t('calendar.items', { count: props.items.length }) }}
      </p>
    </div>
    <div v-if="props.items.length === 0" class="mt-3 text-sm text-slate-500">
      {{ t('calendar.empty') }}
    </div>
    <div v-else class="mt-3 space-y-2">
      <div
        v-for="item in props.items"
        :key="item.id"
        class="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/70 px-3 py-2"
      >
        <div>
          <p class="text-sm font-semibold text-slate-100">{{ item.categoryName }}</p>
          <p class="text-xs text-slate-500">{{ item.memberName }}</p>
          <p v-if="item.note" class="text-xs text-slate-400">{{ item.note }}</p>
        </div>
        <p class="text-sm font-semibold text-amber-200">NT$ {{ item.amount.toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
