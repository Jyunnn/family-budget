<script setup>
import { onMounted } from 'vue'
import { useBudgetStore } from './stores/budget'

const store = useBudgetStore()

onMounted(() => {
  store.loadFromStorage()
})
</script>

<template>
  <div class="min-h-screen text-slate-100">
    <RouterView />
  </div>
</template>

<style scoped>
</style>
