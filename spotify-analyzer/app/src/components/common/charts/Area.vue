<template>
    <apexchart 
      ref="chart"
      class="chart"
      :chart-options="options"
      :chart-data="data"
    ></apexchart>
</template>
<script>
import { Line } from "vue-chartjs";
import 'chartjs-adapter-luxon';
import { Chart as ChartJS, LinearScale, CategoryScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Title, Tooltip, Filler) 
import dayjs from 'dayjs';
import { ref, computed, onMounted } from 'vue';
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(weekOfYear)
export default {
  components: {
    apexchart: Line,
  },
  props: {
    startDate: { default: dayjs().subtract(1, 'month') },
    endDate: { default: dayjs() },
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
          point: {
            borderColor: 'rgba(70,108,128, 0.7)',
            backgroundColor: 'rgba(70,108,128, 1)',
            hitRadius: 20
          }
        },
        scales: {
          x: {
            min: 0,
            max: 23,
            type: 'linear',
            ticks: {
              callback: function (value) {
                return value + 'h';
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.formattedValue + ' écoutes';
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