<template>
  <div>
    <apexchart
      ref="chart"
      height="350px"
      :options="options.chartOptions"
      :series="options.series"
    ></apexchart>
  </div>
</template>
<script>
import VueApexCharts from "vue3-apexcharts";
import dayjs from 'dayjs';
import { watch, reactive, ref, nextTick } from 'vue';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import fr from "apexcharts/dist/locales/fr.json"
dayjs.extend(weekOfYear)
export default {
  components: {
    apexchart: VueApexCharts,
  },
  props: {
    x: {default: () => ([])},
    categories: {default: () => ([])},
  },
  setup(props) {
    const chart = ref(null)
    let options = reactive({
      chartOptions: reactive({
        chart: {
          id: "vuechart-example",
          locales: [fr],
          defaultLocale: 'fr',
          type: 'bar',
          zoom: {
            type: 'x',
            enabled: true,
            autoScaleYaxis: true
          },
          toolbar: {
            tools: {
              download: false
            }
          },
        },
        plotOptions: {
          bar: {
            horizontal: true
          }
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        markers: {
          size: 0,
          style: 'hollow',
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: reactive({
          categories: reactive(props.categories),
        })
      }),
      series: reactive([])
    })

    async function updateDatas() {
      options.series = props.x
      options.chartOptions.xaxis = reactive({categories: reactive(props.categories)})
      if(chart.value) await chart.value.refresh().catch(err=> {})
      await nextTick()
      await nextTick()
      await nextTick()
      await nextTick() // apex chart need 4 tick in vuejs to eat data 
    }
    watch(() => props.x, updateDatas)
    watch(() => props.categories, updateDatas)
    updateDatas()
    return {
      chart,
      options
    }
  },
};
</script>
<style lang="scss" scoped>
</style>