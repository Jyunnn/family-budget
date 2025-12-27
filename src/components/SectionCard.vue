<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <section class="section-card rounded-3xl p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-lg font-semibold text-slate-100">{{ props.title }}</p>
        <p v-if="props.subtitle" class="mt-1 text-sm text-slate-400">
          {{ props.subtitle }}
        </p>
      </div>
      <span
        v-if="props.icon"
        class="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2 text-lg text-slate-300"
      >
        <i :class="props.icon"></i>
      </span>
    </div>
    <div class="mt-4">
      <slot />
    </div>
  </section>
</template>

<style scoped>
</style>
