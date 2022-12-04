<template>
    <apexchart 
      ref="chart"
      class="chart"
      :chart-options="options"
      :chart-data="data"
    ></apexchart>
</template>
<script>
import { Bar } from "vue-chartjs";
import 'chartjs-adapter-luxon';
import { Chart as ChartJS, LinearScale, CategoryScale, BarElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
ChartJS.register(LinearScale, CategoryScale, BarElement, LineElement, Title, Tooltip, Filler) 
import dayjs from 'dayjs';
import { ref, computed, onMounted } from 'vue';
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)
export default {
  components: {
    apexchart: Bar,
  },
  props: {
    startDate: { default: dayjs().subtract(1, 'month') },
    endDate: { default: dayjs() },
    suffix: { default: '' },
    labelFormatter: { default: () => label => label },
    ticksX: { default: () => ({}) },
    scaleX: { default: () => ({}) },
    indicators: { default: () => ([]) },
    x: { default: () => ([]) },
    by: { default: 'days' },
  },
  setup(props) {
    const chart = ref(null)
    onMounted(() => {
      const canvas = chart.value?.chart?.canvas
      if (canvas) canvas.style.maxHeight = '100%'
    })
    return {
      chart,
      data: computed(() => ({
        datasets: props.x
      })),
      options: computed(() => ({
        elements: {
          line: {
            tension: 0.4,
            fill: true,
            borderColor: 'rgba(70,108,128, 0.7)',
          },
          bar: {
            borderColor: 'rgba(70,108,128, 0.7)',
            backgroundColor: 'rgba(70,108,128, 0.6)',
            hitRadius: 20
          }
        },
        scales: {
          x: {
            type: 'linear',
            bounds: 'ticks',
            ...props.scaleX,
            ticks: {
              autoSkip: false,
              minRotation: 90,
              callback: props.labelFormatter,
              ...props.ticksX,
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem, data) {
                return tooltipItem.formattedValue + props.suffix || '';
              }
            }
          }
        }
      }))
    }
  },
};
</script>
<style lang="scss" scoped>
</style>