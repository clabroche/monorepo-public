<template>
  <div class="mini-chart" :style="style">
    <h2 v-if="indicator?.prettyName && showTitle">{{indicator?.prettyName}}</h2>
    <div class="chart" :style="{width: indicator?.prettyName && showTitle ?  '50%' : '100%'}">
      <apexchart
        type="line"
        :options="options.chartOptions"
        :height="height"
        width="100%"
        :series="options.series"
        v-if="x.length"
      ></apexchart>
      <spinner v-else :size="40"/>
    </div>
    <div class="delete" v-if="canDelete"><i class="fas fa-trash" aria-hidden="true"></i></div>
    <div class="times"  v-if="canDelete"><i class="fas fa-times" aria-hidden="true"></i></div>
  </div>
</template>
<script>
import VueApexCharts from "vue3-apexcharts";
import { watch, reactive, computed } from 'vue';
import Spinner from '../Spinner.vue';
import fr from "apexcharts/dist/locales/fr.json"
export default {
  components: {
    apexchart: VueApexCharts,
    Spinner,
  },
  props: {
    indicator: {default: null},
    showTitle: {default: true},
    canDelete: {default: true},
    flat: {default: false},
    height: {default: '75px'},
    x: {default: () => ([])},
    y: {default: () => ([])},
    theme: {default: () => ({indicator: null, color:"#ffffff"})},
  },
  setup(props) {

    const getContrast50 = hexcolor => {
      if (hexcolor === 'transparent') return 'black'
      hexcolor = hexcolor.split('#').pop()
      return (parseInt(hexcolor, 16) > 0xffffff / 2) ? '#000000' : '#ffffff';
    }
    const style = computed(() => props.flat ? {
      background: props.theme.color,
      color: getContrast50(props.theme.color),
      height: props.height
    } : {
      background: `linear-gradient(149deg, ${props.theme.color} 0%, #ddd 100%)`,
      color: getContrast50(props.theme.color),
      height: props.height
    })
    let options = reactive({
      chartOptions: reactive({
        chart: {
          id: "vuechart-example",
          locales: [fr],
          defaultLocale: 'fr',
          toolbar: {show: false},
          dropShadow: {
            enabled: true,
            opacity: 0.1
          }
        },
        colors: [getContrast50(props.theme.color)],
        grid: {
          show: false
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        legend: {
          show: false,
        },
        tooltip: {
          enabled: true,
          x: {
            show: false,
            format: 'dd MMM yyyy'
          },
          y: {
            formatter(val) {
              // @ts-ignore
              return ''+(!Number.isNaN(val) ? (+(Math.round(val + 'e+2')  + 'e-2')).toLocaleString('fr', {maximumFractionDigits: 2}) : val)  + (props?.indicator?.suffix || '')
            },
            title: {formatter: () => ' '}
          }
        },
        yaxis: {
          labels: {
            show: false
          },
        },
        xaxis: {
          type: 'datetime',
          floating: true,
          tickAmount: 4,
          axisTicks: {
            show: false
          },
          axisBorder: {
            show: false
          },
          labels: {
            show: false
          },
          categories: reactive(props.x),
        },
      }),
      series: reactive(props.y)
    })

    function updateDates() {
      const chartOptions = {
        ...options.chartOptions
      }
      chartOptions.xaxis.categories = props.y
      options.chartOptions = chartOptions
    }
    async function updateDatas() {
      updateDates()
      options.series = props.x
    }
    watch(() => props.indicator, () => updateDatas(), {deep: true})
    watch(() => props.x, () => updateDatas(), {deep: true})
    watch(() => props.y, () => updateDatas(), {deep: true})
    updateDatas()

    return {
      options,
      style
    }
  },
};
</script>

<style lang="scss" scoped>
.mini-chart {
  display: flex;
  padding: 0 10px;
  align-items: center;
  color: white;
  position: relative;
  h2 {
    font-size: 0.9em;
    width: 50%;
  }
  .delete {
    position: absolute;
    background-color: rgba(0,0,0,0.5);
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: 300ms;
    cursor: pointer;
  }
  .times {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 300ms;
    cursor: pointer;
  }
  &:hover {
    .times {
      opacity: 0;
    }
    .delete {
      color: white;
      opacity: 1;
    }
  }
}
</style>