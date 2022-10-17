<template>
    <apexchart 
      ref="chart"
      :chart-options="{
        elements: {
          line: {
            tension: 0.4,
            fill: true,
            borderColor: 'rgba(70,108,128, 0.7)',
          },
          point: {
            borderColor: 'rgba(70,108,128, 0.7)',
            backgroundColor: 'rgba(70,108,128, 0.7)',

          }
        },
        scales: {
            x: {
                type: 'timeseries',
                time: {
                  unit: 'day'
                }
            }
        }
      }"
      :chart-data="{
        datasets: x
      }"
    ></apexchart>
</template>
<script>
import {Line} from "vue-chartjs";
import 'chartjs-adapter-luxon';
import { Chart as ChartJS, LinearScale, TimeSeriesScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js'
ChartJS.register(LinearScale, TimeSeriesScale, PointElement, LineElement, Title, Tooltip, Filler)
import dayjs from 'dayjs';
import { ref, computed } from 'vue';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import fr from "apexcharts/dist/locales/fr.json"
dayjs.extend(weekOfYear)
export default {
  components: {
    apexchart: Line,
  },
  props: {
    startDate: {default: dayjs().subtract(1, 'month')},
    endDate: {default: dayjs()},
    indicators: {default: () => ([])},
    x: {default: () => ([])},
    by: {default: 'days'},
  },
  setup(props, comp) {
    const chart = ref(null)
    let options = computed(() => {
      // updateZoom(
      //   dayjs(props.startDate).toDate().getTime(),
      //   dayjs(props.endDate).toDate().getTime(),
      // )
      return {
        chart: {
          id: "vuechart-example",
          locales: [fr],
          defaultLocale: 'fr',
          sparkline: {
            enabled: true
          },
          height: '100%',
          type: 'area',
          zoom: {
            type: 'x',
            enabled: true,
            autoScaleYaxis: false
          },
          toolbar: {
            show: false,
            tools: {
              download: false
            }
          },
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 0,
          style: 'hollow',
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy'
          },
          y: {

          }
        },
        dataLabels: {
          enabled: false,

        },
        yaxis: {
          min: 0,
          labels: {

          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            format: 'dd MMM yyyy'
          }
        },
      }
    })
    const series = computed(() => props.x)
    const updateZoom = (from, to) => {
      // chart.value.chart.zoomX(from,to)
    }

    return {
      chart,
      options,
      series
    }
  },
};
</script>
<style lang="scss" scoped>
.root-chart {
}
.chart {
}
</style>