<script setup>
import HeaderBar from '../components/HeaderBar.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
</script>

<template>
  <div class="mesh-grid min-h-screen">
    <HeaderBar />
    <main class="mx-auto max-w-6xl px-4 pb-16 pt-6 lg:px-6">
      <div class="space-y-6">
        <SettingsPanel />
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
