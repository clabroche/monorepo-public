<template>
  <div class="root-home">
    <div class="container">
      <input type="date" v-model="date">
      <input type="text" @input="set(search, $event.target.value)">
      <spinner v-if="loading"></spinner>
      <div class="time-container">
        <div class="film" v-for="film of films">
          <div class="title">{{ film.title }}</div>
          <div class="times">
            <template v-for="time of film.screenings">
              <Popover v-if="(time?.start && time?.end)" class="time" :style="{
                left: getPeriod(time).offsetPercent + '%',
                width: getPeriod(time).durationPercent + '%'
              }" trigger="mouseenter" :class="{ disabled: time.disable }">
                <template #trigger>
                  <div class="bar">
                  </div>
                </template>
                <template #content>
                  {{ time.start }} -> {{ time.end }}
                  <button @click="routine.push({ ...film, ...{ time } })">Ajouter </button>
                </template>
              </Popover>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="routine">
      <h1>Mon parcours</h1>
      <ul class="films">
        <li class="film" v-for="(film, i) of routine">
          <button class="danger" @click="routine.splice(i, 1)">Supprimer </button>

          {{ film.title }} <br>
          {{ film.time.start }} -> {{ film.time.end }}
          <br><br>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>

import Screening from "@clabroche-org/ugc-explorer-models/src/models/Screening";
import debounce from 'debounce'
import dayjs from "dayjs";
import fr from "dayjs/locale/fr";
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import { computed, onMounted, ref, watchEffect } from "vue";
import Spinner from '../components/common/Spinner.vue'
import Popover from "../components/common/Popover.vue";
dayjs.locale(fr)
dayjs.extend(duration)
dayjs.extend(relativeTime)
const screenings = ref([])
onMounted(async () => {
})
const _debounce = debounce
const search = ref('')
const date = ref('')
const loading = ref(false)
const routine = ref([])
const set = _debounce((set, value) => search.value = value, 50)
watchEffect(async () => {
  loading.value = true
  const day = date.value ? dayjs(date.value) : dayjs()
  screenings.value = await Screening.all('', day)
  loading.value = false
})

function group(films) {
  const versions = {}
  films.map(film => {
    film.screenings.forEach(screening => {
      const field = `${film.title}-${screening.version}-${screening.dimension}`
      if (!versions[field]) versions[field] = {
        ...film,
        version: screening.version,
        dimension: screening.dimension,
        screenings: []
      }
      versions[field].screenings.push(screening)
    });
  })
  return Object.keys(versions).map(key => versions[key])
}

const films = computed(() => {
  return group(screenings.value.map(film => {
    film.screenings = film.screenings.map(screening => {
      const start = screening.start
      const end = screening.end
      const startHour = dayjs().set('hours', start.split(':')[0]).set('minutes', start.split(':')[1]).subtract(10, 'minute')
      const endHour = dayjs().set('hours', end.split(':')[0]).set('minutes', end.split(':')[1]).add(10, 'minute')
      const conflict = routine.value.some(({ time, title }) => {
        const startrHour = dayjs().set('hours', time.start.split(':')[0]).set('minutes', time.start.split(':')[1])
        const endrHour = dayjs().set('hours', time.end.split(':')[0]).set('minutes', time.end.split(':')[1])
        return startHour.isAfter(startrHour) && startHour.isBefore(endrHour)
          || endHour.isAfter(startrHour) && endHour.isBefore(endrHour)
          || startHour.isBefore(startrHour) && endHour.isAfter(endrHour)
          || startHour.isBefore(endrHour) && endHour.isAfter(endrHour)
          || startHour.isSame(startrHour) && endHour.isSame(endrHour)
          || film.title === title
      })
      screening.disable = conflict
      return screening
    })
    return film
  })).filter(f => f.title.toUpperCase().includes(search.value.toUpperCase()))
})

function getPeriod({ start, end }) {
  const startOfDay = dayjs().startOf('day').set('hour', 10)
  const endOfDay = dayjs().endOf('day').set('hour', 23)
  const startHour = dayjs().set('hours', start.split(':')[0]).set('minutes', start.split(':')[1])
  const endHour = dayjs().set('hours', end.split(':')[0]).set('minutes', end.split(':')[1])
  const duration = endHour.diff(startHour, 'minutes')
  const nbMinutesInDay = endOfDay.diff(startOfDay, 'minutes')
  const offset = startHour.diff(startOfDay, 'minutes')
  const durationPercent = Math.floor(duration * 100 / nbMinutesInDay)
  const offsetPercent = Math.floor(offset * 100 / nbMinutesInDay)
  return {
    start, end,
    durationPercent,
    offsetPercent,
  }
}
</script>
<style lang="scss" scoped>
.root-home {
  padding: 30px;
  display: flex;
  box-sizing: border-box;
  gap: 10px;

          @media screen and (max-width: 800px) {
            flex-direction: column;
            }

  .container {
    width: 100%;

    .time-container {
      display: flex;
      flex-direction: column;

      .film {
        display: flex;
        flex-direction: row;
        height: 35px;

        .title {
          overflow: hidden;
          width: 340px;
          @media screen and (max-width: 900px) {
            width: 140px;
            font-size: 0.8em;
          }
          display: flex;
          flex-shrink: 0;
          align-items: center;
          padding: 10px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
        }

        .times {
          display: flex;
          position: relative;
          flex-grow: 1;
          background-color: rgba(0, 0, 0, 0.1);

          .time {
            position: absolute;
            height: 10px;
            @include backgroundGradient;

            top: 50%;
            transform: translateY(-50%);
            border-radius: 100px;

            &.disabled {
              background-color: rgba(0, 0, 0, 0.5);
              background: rgba(0, 0, 0, 0.5);
            }

            .bar {
              height: 100%;
              width: 100%;
            }
          }
        }
      }
    }
  }

  .routine {
    display: flex;
    padding: 10px;
    box-sizing: border-box;
    flex-direction: column;
    flex-shrink: 0;
    width: 300px;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
  }
}
</style>