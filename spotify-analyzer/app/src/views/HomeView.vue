<template>
  <div class="root-home">
      <h1>Analyses de vos musique</h1>
      <div class="dates">
        <input type="date" v-model="from">
        <i class="fas fa-arrow-right"></i>
        <input type="date" v-model="to">
      </div>
      <div class="container line">
        <template v-for="stat of stats">
          <template v-if="stat.type ==='bestArtists'">
            <section class="history">
              <h2>Mes artistes préférés</h2>
              <div class="leaderboard">
                <div class="line" v-for="artist of stat.leaderBoard.slice(0, 40)">
                  <Line 
                    :img="Dictionnary.artists.value[artist._id]?.images?.[0]?.url"
                    :infos="[
                      {text: `${artist.count} écoutes`, icon:'fas fa-redo'},
                      {text: Dictionnary.artists.value[artist._id]?.name || '', icon:'fas fa-user'}
                    ]"
                  />
                </div>
              </div>
            </section>
          </template>
          <template v-if="stat.type ==='bestTitles'">
            <section class="history">
              <h2>Mes titres préférés</h2>
              <div class="leaderboard">
                <div class="line" v-for="track of stat.leaderBoard.slice(0, 40)">
                  <TitleInfosLine :track-id="track._id" :additionalInfos="[
                    {text: `${track.count} écoutes`, icon:'fas fa-redo'},
                  ]"/>
                </div>
              </div>
            </section>
          </template>
          <template v-if="stat.type ==='features'">
            <section class="history">
              <h2>Statistiques sur les musiques</h2>
              <div class="leaderboard">
                <div class="line line-feature" v-for="feature of features">
                  <div>
                    <i :class="feature.icon"></i>
                    {{feature.label}}  
                  </div>
                  <Progress v-if="feature.type === 'bar'" class="stat-score progress"
                    :value="feature.score || 0"
                    :max="feature.max || 100"
                    :noLabel="true"
                  />
                  <div v-else class="stat-score">{{feature.score}}{{feature.suffix}}</div>
                </div>
              </div>
            </section>
          </template>
          <template v-if="stat.type ==='genres'">
            <section class="history">
              <h2>Mes Genres préférés</h2>
              <div class="leaderboard">
                <div class="line" v-for="genre of stat.genres.slice(0, 40)">
                  <Line :infos="[
                    {text: `${genre.count} écoutes`, icon:'fas fa-redo'},
                    {text: genre._id, icon:'fas fa-volume-off'}
                  ]" />
                </div>
              </div>
            </section>
          </template>
          <template v-if="stat.type ==='listeningByDays'">
            <section class="history" style="overflow: hidden;">
              <h2>Mon nombre d'écoutes par jour</h2>
              <AreaTimeSeriesChart class="chart" 
                :startDate="dayjs(from).toISOString()"
                :endDate="dayjs(to).toISOString()"
                :x="[{
                  fill: {
                    target: 'origin',
                    above: 'rgba(70,108,128, 0.2)', 
                  }
                },{
                  data: stat.value?.map(val => ({x: val.date, y: val.nbListening}))
                }]"
              />
            </section>
          </template>
          <template v-if="stat.type ==='listeningTopHours'">
            <section class="history" style="overflow: hidden;">
              <h2>Mes meilleures heures d'écoutes</h2>
              <Bar class="chart" 
                :startDate="dayjs(from).toISOString()"
                :endDate="dayjs(to).toISOString()"
                suffix=" écoutes"
                :ticksX="{count: 24, stepSize: 1}"
                :scaleX="{min: 0, max: 24}"
                :labelFormatter="value => (value + 'h')"
                :x="[{
                  fill: {
                    target: 'origin',
                    above: 'rgba(70,108,128, 0.2)', 
                  }
                },{
                  data: stat.value.map(val => ({
                    x: val._id,
                    y: val.count
                  }))
                }]"
              />
            </section>
          </template>

          <template v-if="stat.type ==='listeningTopDays'">
            <section class="history" style="overflow: hidden;">
              <h2>Mes meilleures jours d'écoutes</h2>
              <Bar class="chart" 
                :startDate="dayjs(from).toISOString()"
                :endDate="dayjs(to).toISOString()"
                :ticksX="{count: 7, stepSize: 1}"
                :scaleX="{min: 1, max: 7}"
                :labelFormatter="value => ([
                  '', 'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
                ][value])"
                :x="[{
                  fill: {
                    target: 'origin',
                    above: 'rgba(70,108,128, 0.2)', 
                  }
                },{
                  data: stat.value.map(val => ({
                    x: val._id,
                    y: val.count
                  }))
                }]"
              />
            </section>
          </template>
          <template v-if="stat.type ==='differentArtists'">
            <section class="history">
              <h2>Nombres d'artistes différents</h2>
              <div class="leaderboard">
                <div class="line-feature" :class="{line: artistsStat.type !== 'leaderBoard'}" v-for="artistsStat of artistsStats">
                  <div>
                    <i :class="artistsStat.icon"></i>
                    {{artistsStat.label}}
                  </div>
                  <Progress v-if="artistsStat.type === 'bar'" class="stat-score progress" :value="artistsStat.score || 0"
                    :max="artistsStat.max || 100" :noLabel="true" />
                  <div v-else-if="artistsStat.type === 'leaderBoard'">
                    <div class="leaderboard column">
                      <div class="line" v-for="artist of artistsStat.score.slice(0, 40)">
                        <Line 
                          :img="Dictionnary.artists.value[artist._id]?.images?.[0]?.url"
                          :infos="[
                            {text: `${artist.count} écoutes`, icon:'fas fa-redo'},
                            {text: Dictionnary.artists.value[artist._id]?.name || '', icon:'fas fa-user'}
                          ]"
                        />
                      </div>
                    </div>
                  </div>
                  <div v-else class="stat-score">{{artistsStat.score}}{{artistsStat.suffix}}</div>
                </div>
              </div>
            </section>
          </template>
        </template>
      </div>
  </div>
</template>

<script setup>
import History from "@clabroche/spotify-analyzer-models/src/models/History";
import Dictionnary from '../services/Dictionnary'
import {onMounted, ref, computed, watchEffect} from 'vue'
import TitleInfosLine from "../components/TitleInfosLine.vue";
import Line from "../components/Line.vue";
import Progress from "../components/common/Progress.vue";
import dayjs from "dayjs";
import fr from "dayjs/locale/fr";
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import AreaTimeSeriesChart from "../components/common/charts/AreaTimeSeriesChart.vue";
import Bar from "../components/common/charts/Bar.vue";
dayjs.locale(fr)
dayjs.extend(duration)
dayjs.extend(relativeTime)

/** @type {import('vue').Ref<any[]>} */
const stats = ref([])
const triggerUpdate = ref(0)
const from = ref(dayjs().subtract(1, 'week').format('YYYY-MM-DD'))
const to = ref(dayjs().format('YYYY-MM-DD'))
onMounted(async () => {
  History.updated.subscribe(async () => {
    triggerUpdate.value++
  })
})

watchEffect(async () => {
  triggerUpdate.value
  stats.value = await History.stats(from.value, to.value)
  stats.value.forEach(stat => {
    if (stat.type === 'bestArtists') Dictionnary.addArtist(...stat.leaderBoard.map(l => l._id))
    if (stat.type === 'bestTitles') Dictionnary.addTrack(...stat.leaderBoard.map(l => l._id))
  })
})

const analyze = {
  avg_loundness(score) {
    return {
      label: 'Intensité',
      score: 60 - Math.floor(Math.abs(score)),
      max: 60,
      icon: '',
      type: 'bar'
    }
  },
  avg_danceability(score) {
    return {
      label: 'Dance',
      score: score,
      max: 1,
      icon: 'fas fa-running',
      type: 'bar'
    }
  },
  avg_energy(score) {
    return {
      label: 'Énergie',
      score: score,
      max: 1,
      icon: 'fas fa-battery-full',
      type: 'bar'
    }
  },
  avg_key(score) {
    score = Math.floor(score)
    const keys = ['Do','Do#','Ré','Ré#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si',]
    if(score === -1) score = 'Inconnu'
    else score = keys[score]
    return {
      label: 'Ton',
      score: score,
      icon: 'fas fa-music',
      type: 'text'
    }
  },
  avg_mode(score) {
    score = Math.round(score)
    return {
      label: 'Tonalité',
      icon: 'fas fa-music',
      score: score ? 'Majeur' : 'Mineur',
      type: 'text'
    }
  },
  avg_speechiness(score, stats) {
    return {
      label: 'Chansons parlées',
      score: score,
      max: 1,
      type: 'bar'
    }
  },
  avg_acousticness(score, stats) {
    return {
      label: 'Chansons acoustiques',
      score: score,
      max: 1,
      icon: 'fas fa-guitar',
      type: 'bar'
    }
  },
  avg_instrumentalness(score, stats) {
    
    return {
      label: 'Chansons instrumentales',
      score: score,
      icon: 'fas fa-drum',
      max: 1,
      type: 'bar'
    }
  },
  avg_liveness(score, stats) {
    return {
      label: 'Chansons en lives',
      score: score,
      icon: 'fas fa-microphone',
      max: 1,
      type: 'bar'
    }
  },
  avg_valence(score) {
    if (score < 0.20) score = 'Négative'
    else if (score < 0.40) score = 'Plutôt négative'
    else if (score < 0.60) score = 'Neutre'
    else if (score < 0.80) score = 'Plutôt positive'
    else score = 'Positive'
    return {
      label: 'Positivité musicale',
      icon: 'fas fa-cloud-sun',
      score: score,
    }
  },
  avg_tempo(score) {
    return {
      label: 'Tempo',
      score: Math.floor(score),
      icon: 'fas fa-drum',
      suffix: 'bpm',
    }
  },
  avg_duration_ms(score) {
    return {
      label: 'Durée moyenne',
      icon: 'fas fa-clock',
      score: dayjs.duration(score, 'milliseconds').humanize(),
    }
  },

  sum_duration_ms(score) {
    return {
      label: 'Durée cumulée',
      icon: 'fas fa-clock',
      score: dayjs.duration(score, 'milliseconds').humanize(),
    }
  },
  
  nbDifferentArtists(score) {
    return {
      label: 'Artistes différents sur la période',
      icon: 'fas fa-users',
      score
    }
  },
  newArtists(score) {
    return {
      label: 'Artistes découverts',
      icon: 'fas fa-users',
      type: 'leaderBoard',
      score
    }
  }
}
const artistsStats = computed(() => {
  const differentArtists = stats.value.find(stat => stat.type === "differentArtists");
  return [
    'nbDifferentArtists',
    'newArtists',
  ].map((statName) => {
    return analyze[statName] ? analyze[statName](differentArtists[statName], differentArtists) : null
  }).filter(a => a)
})
const features = computed(() => {
  const featureStat = stats.value.find(stat => stat.type === "features");
  return [
    // 'avg_loundness',
    'avg_danceability',
    'avg_energy',
    // 'avg_speechiness',
    'avg_acousticness',
    'avg_instrumentalness',
    'avg_liveness',
    'avg_key',
    'avg_mode',
    'avg_valence',
    'avg_tempo',
    'avg_duration_ms',
    'sum_duration_ms',
  ].map((feature) => {
    return analyze[feature] ? analyze[feature](featureStat.leaderBoard[feature], featureStat.leaderBoard) : null
  }).filter(a => a)
})



</script>
<style lang="scss" scoped>
.root-home {
  padding: 30px;
  box-sizing: border-box;
}
h1 {
  text-align: center;
  margin: 0;
}
.container.line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  &:hover {
    background-color: inherit;
  }
}
section {
  background-color: white;
  min-width: 300px;
  max-width: 500px;
  flex: 1;
  border-radius: 50px;
  height: 400px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  margin-top: 0 !important;
  box-shadow: 0 0 10px 0 rgba(0,0,0,0.2);

  h2 {
    margin-top: 10px;
  }
  &>div {
    overflow: auto;

  }
}
.line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 5px 0;
  width: 100%;
  position: relative;
  &::before {
    content: "";
    width: 75%;
    bottom: 0;
    height: 1px;
    background-color: #eee;
    position: absolute;
    margin-left: 50%;
    transform: translateX(-50%);
  }
  &:hover {
    background-color: rgba(0,0,0,0.05);
  }
  .stat-score {
    font-weight: bold;
    max-width: 40%;
  }
}
.leaderboard {
  display: flex;
  flex-direction: column;
}
.logo {
  height: 40px;
  width: 40px;
  border-radius: 50%;
}

.dates {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  flex-wrap: wrap;
  input {
    width: 150px;
    font-size: 1em;
    border: none;
    background-color: white;
    border-radius: 10px;
    border: 1px solid #ddd;
    box-shadow: 0 0 10px 0 #ddd;
    padding: 0 10px;
    font-weight: bold;
    color: var(--headerBgColorAccent)
  }
}

@media (max-width: 800px) {
  .root-home {
    padding: 5px;
    h1 {
      margin-top: 10px;
    }
  }
  .dates {
    gap: 0;
    flex-direction: column;
    i {
      transform: rotate(90deg);
    }
  }
  .line-feature {
    flex-direction: column;
    align-items: flex-start;
    .stat-score {
      margin-left: 15px;
      font-size: 1em;
      max-width: 100%;
    }
  }
}
@media (max-width: 400px) {
  .root-home {
    font-size: 0.8em;
    section {
      min-width: 200px;
    }
  }
}
</style>