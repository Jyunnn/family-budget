<script setup>
import HeaderBar from '../components/HeaderBar.vue'
import AccountInfoCard from '../components/AccountInfoCard.vue'
import DepositForm from '../components/DepositForm.vue'
import TransactionList from '../components/TransactionList.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-950">
    <HeaderBar />
    <main class="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div class="grid gap-6 lg:grid-cols-3">
        <div class="lg:col-span-1 space-y-6">
          <AccountInfoCard />
          <DepositForm />
        </div>
        <div class="lg:col-span-2">
          <TransactionList />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
</style>
