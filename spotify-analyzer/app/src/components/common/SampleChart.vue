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
    startDate: {default: dayjs().subtract(1, 'month')},
    endDate: {default: dayjs()},
    indicators: {default: () => ([])},
    x: {default: () => ([])},
    y: {default: () => ([])},
    by: {default: 'months'},
    min: {default: null},
    max: {default: null},
  },
  setup(props, comp) {
    const chart = ref(null)
    let options = reactive({
      chartOptions: reactive({
        chart: {
          id: "vuechart-example",
          locales: [fr],
          defaultLocale: 'fr',
          type: 'area',
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
            formatter(val,{w: {config: {series}}, seriesIndex, dataPointIndex}) {
              const line = series[seriesIndex]
              const indicator = props.indicators.find(_indicator => _indicator.prettyName === line.name)
              const point = line.data[dataPointIndex]
              if(point.transactions) {
                const format = point.transactions.map(tr => {
                  return tr.info.join(' ').split('').slice(0,50).join('')
                }).join('<br>');
                return val + '€\n<br> ' + format
              }

              if(!indicator) return val + '€'
              // @ts-ignore
              return (!Number.isNaN(val) ? +(Math.round(val + 'e+2')  + 'e-2') : val)  + indicator.suffix
            },
          }
        },
        dataLabels: {
          enabled: false,
          formatter(val) {
            // @ts-ignore
            return  (!Number.isNaN(val) ? +(Math.round(val + 'e+2')  + 'e-2') : val)  
          }
        },
        yaxis: {
          labels: {
            formatter(val) {
              // @ts-ignore
              return  (!Number.isNaN(val) ? +(Math.round(val + 'e+2')  + 'e-2') : val)  
            }
          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            format: 'dd MMM yyyy'
          }
        },
      }),
      series: reactive([])
    })
    if(props.min != null) options.chartOptions.yaxis.min = props.min
    if(props.max != null) options.chartOptions.yaxis.max = props.max
    const updateZoom = () => {
      chart.value.chart.zoomX(
        props.startDate.toDate().getTime(),
        props.endDate.toDate().getTime()
      )
    }
    async function updateDatas() {
      options.series = props.x
      await nextTick()
      await nextTick()
      await nextTick()
      await nextTick() // apex chart need 4 tick in vuejs to eat data 
      updateZoom()
    }
    watch(() => props.startDate, updateZoom)
    watch(() => props.endDate, updateZoom)
    watch(() => props.x, updateDatas)
    watch(() => props.y, updateDatas)
    watch(() => props.by, updateDatas)
    watch(() => props.indicators, updateDatas, {deep: true})
    watch(() => chart.value?.chart?.theme?.colors, () => {
      if(chart.value?.chart?.theme?.colors) {
        comp.emit('update-theme', chart?.value?.chart?.theme?.colors.map((color, i) => ({
          indicator: props.indicators[i],
          color,
        })))
      }
    })
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