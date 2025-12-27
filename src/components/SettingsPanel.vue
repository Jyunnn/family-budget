<script setup>
import SectionCard from './SectionCard.vue'
import MemberManager from './MemberManager.vue'
import CategoryManager from './CategoryManager.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <SectionCard :title="t('settings.title')" :subtitle="t('settings.subtitle')" icon="fa-solid fa-sliders">
    <div class="grid gap-6 lg:grid-cols-2">
      <MemberManager />
      <CategoryManager />
    </div>
  </SectionCard>
</template>

<style scoped>
</style>
