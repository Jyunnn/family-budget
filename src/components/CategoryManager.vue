<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useI18n } from 'vue-i18n'

const store = useBudgetStore()
const { t } = useI18n()

const form = ref({ name: '' })
const editingId = ref(null)
const errorMessage = ref('')

const startEdit = (category) => {
  editingId.value = category.id
  form.value = { name: category.name }
}

const resetForm = () => {
  form.value = { name: '' }
  editingId.value = null
  errorMessage.value = ''
}

const saveCategory = () => {
  errorMessage.value = ''
  if (!form.value.name) {
    errorMessage.value = t('category.requiredError')
    return
  }
  if (editingId.value) {
    store.updateCategory(editingId.value, { name: form.value.name })
  } else {
    store.addCategory({ name: form.value.name })
  }
  resetForm()
}

const removeCategory = (categoryId) => {
  const result = store.removeCategory(categoryId)
  if (!result.removed) {
    errorMessage.value = t('category.inUse')
  }
}
</script>

<template>
  <div class="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-semibold text-slate-100">{{ t('settings.categoriesTitle') }}</p>
      <button
        class="rounded-lg border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs text-slate-200"
        type="button"
        @click="resetForm"
      >
        {{ t('actions.clear') }}
      </button>
    </div>
    <form class="mt-3 grid gap-3" @submit.prevent="saveCategory">
      <input
        v-model="form.name"
        class="rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
        type="text"
        :placeholder="t('category.namePlaceholder')"
      />
      <button class="rounded-xl bg-sky-400/90 px-3 py-2 text-sm font-semibold text-slate-900" type="submit">
        {{ editingId ? t('category.update') : t('category.add') }}
      </button>
      <p v-if="errorMessage" class="text-xs text-amber-200">{{ errorMessage }}</p>
    </form>

    <div class="mt-4 space-y-2">
      <div
        v-for="category in store.categories"
        :key="category.id"
        class="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2"
      >
        <div>
          <p class="text-sm font-semibold text-slate-100">{{ category.name }}</p>
          <p class="text-xs" :class="category.isActive ? 'text-emerald-300' : 'text-slate-500'">
            {{ category.isActive ? t('category.active') : t('category.disabled') }}
          </p>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
            type="button"
            @click="startEdit(category)"
          >
            {{ t('actions.edit') }}
          </button>
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
            type="button"
            @click="store.toggleCategory(category.id, !category.isActive)"
          >
            {{ t('actions.toggle') }}
          </button>
          <button
            class="rounded-lg border border-slate-700/70 bg-slate-950/50 px-2 py-1 text-slate-200"
            type="button"
            @click="removeCategory(category.id)"
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
