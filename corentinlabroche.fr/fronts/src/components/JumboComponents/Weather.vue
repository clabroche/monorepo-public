<template>
  <div class="label" v-if="initialized && !error">
    <div class="container">
      <doughtnut-chart class="chart" :value="percent" style="position: absolute; top: -5px; width: 100%; z-index: -1"/>
      <img class="current-weather" crossorigin="anonymous" :src="weather.icon" alt="" style="margin-top: 25px; z-index: 1;transform: translateY(15px)">
      <div class="sun">
        <span>{{weather.sunrise}}</span>
        <span>{{weather.sunset}}</span>
      </div>
      <div class="desc-container">
        {{weather.description}}
        <span class="temp">{{weather.temp}}</span>
      </div>
      
      <div class="week-container">
        <div v-for="day in weather.week" :key="day.dt" class="weekDay">
          {{formatDate(day.dt)}}
          <img crossorigin="anonymous" :src="getIcon(day.weather[0].icon)" alt=""/>
        </div>
      </div>
      <div class="author">
        Météo
      </div>
    </div>

  </div>
  <div class="label" v-else-if="error">
    {{error}}
    <div class="author">
      Météo
    </div>
  </div>
  <div class="label" v-else>
    Donnez l'accés à votre position pour que je puisse vous donnez la météo
    <div class="author">
      Météo
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import * as locale from 'dayjs/locale/fr'
import dayjs from 'dayjs';
import {ref, computed, onMounted, reactive} from 'vue'
import DoughtnutChart from '../DoughtnutChart.vue';
import env from '../../services/env';
dayjs.locale(locale)

const initialized = ref(false)
const geo = ref({
  lat: 0,
  lon: 0,
})
const error = ref(null)

const formatDate = (unix) => {
  const dayName = dayjs.unix(unix).locale('fr').format('dddd')
  return dayName.charAt(0).toUpperCase() + dayName.slice(1)
}
const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((_geo) => {
      geo.value.lat = _geo.coords.latitude
      geo.value.lon = _geo.coords.longitude
      getWeather()
      initialized.value = true
    }, () => {
      initialized.value = false
      error.value = "Donnez l'accés à votre position pour que je puisse vous donnez la météo"
    });
  } else {
    error.value = "Je ne peux pas te donner la météo depuis ton appareil"
    initialized.value = false;
  }
}

const weather = reactive({
  icon: '',
  description: '',
  temp: '',
  sunrise: '',
  sunset:'',
  week: [],
})

const getWeather = async () => {
  if(!env.WEATHER_APIKEY) {
    error.value = "L'application n'est pas encore configuré pour donner la météo, réessayez plus tard."
    return
  }
  const {data: _weather} = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${geo.value.lat}&lon=${geo.value.lon}&appid=${env.WEATHER_APIKEY}&lang=fr&units=metric`)
    .catch(() => {
      error.value = "Je n'arrives pas à accéder à la météo pour le moment, réessayez plus tard."
      return {data: null}
    })
  if(_weather) {
    const description = _weather.current.weather[0].description
    weather.icon = getIcon(_weather.current.weather[0].icon)
    weather.description = description.charAt(0).toUpperCase() + description.slice(1)
    weather.temp = _weather.current.temp.toFixed() + '°C' 
    weather.sunrise = dayjs.unix(_weather.current.sunrise).format('HH:mm').replace(':', 'h')
    weather.sunset = dayjs.unix(_weather.current.sunset).format('HH:mm').replace(':', 'h') 
    weather.week = _weather.daily
  }
}
const getIcon = icon => `https://openweathermap.org/img/wn/${icon}@2x.png`
const percent = computed(() => {
  var dt = new Date();
  var secs = dt.getSeconds() + (60 * (dt.getMinutes() + (60 * dt.getHours())));
  return secs * 100 / 86400
})
onMounted(getLocation)
</script>

<style lang="scss" scoped>
.label {
  max-width: 90%;
  justify-content: center;
  text-align: center;
}
.week-container {
  display: flex;
  overflow: auto;
  margin-top: 40px;
  justify-content: flex-start;
  gap: 10px;
  .weekDay {
    font-size: 0.4em;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

  }
}
img{
  height: 75px;
  width: 75px;
  background-color: rgba(255,255,255, 0.4);
  border-radius: 50%;
}

.container {
  position: relative;
  overflow: hidden;
  width: 100%;
}
.desc-container {
  margin-top: 30px
}
.sun {
  font-size: 0.6em;
  margin-top: -40px;
  &>span {
    margin: 0 50px
  }
}
.temp {
  font-size: 0.6em;
}
.author {
  text-align: end;
  justify-self: flex-end;
  align-self: flex-end;
  font-size: 0.5em;
  font-style: italic;
  text-decoration: underline;
  padding: 10px 40px;
  box-sizing: border-box;
}
@media (max-width: 800px) {
  .current-weather {
    width: 50px;
    height: 50px;
  }
  .chart {
    margin-top: -20px;
    width: 25px;
  }
  .sun {
    margin-top: -30px;
    span {
      margin: 0 30px;
    }
  }
}
</style>