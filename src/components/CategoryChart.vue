<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  labels: {
    type: Array,
    default: () => []
  },
  values: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()

const chartRef = ref(null)
let chartInstance = null
const datasetLabel = computed(() => t('chart.spendLabel'))

const buildChart = () => {
  if (!chartRef.value) return
  const context = chartRef.value.getContext('2d')
  if (!context) return

  const data = {
    labels: props.labels,
    datasets: [
      {
        label: datasetLabel.value,
        data: props.values,
        backgroundColor: [
          'rgba(56, 189, 248, 0.6)',
          'rgba(251, 146, 60, 0.6)',
          'rgba(45, 212, 191, 0.6)',
          'rgba(129, 140, 248, 0.6)',
          'rgba(244, 114, 182, 0.6)'
        ],
        borderColor: 'rgba(15, 23, 42, 0.8)',
        borderWidth: 2
      }
    ]
  }

  chartInstance = new Chart(context, {
    type: 'doughnut',
    data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#cbd5f5'
          }
        }
      }
    }
  })
}

const updateChart = () => {
  if (!chartInstance) return
  chartInstance.data.labels = props.labels
  chartInstance.data.datasets[0].data = props.values
  chartInstance.data.datasets[0].label = datasetLabel.value
  chartInstance.update()
}

onMounted(() => {
  buildChart()
})

watch(
  () => [props.labels, props.values, datasetLabel.value],
  () => {
    if (!chartInstance) {
      buildChart()
      return
    }
    updateChart()
  },
  { deep: true }
)

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})
</script>

<template>
  <div class="h-64 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3">
    <canvas ref="chartRef" class="h-full w-full"></canvas>
  </div>
</template>

<style scoped>
</style>
