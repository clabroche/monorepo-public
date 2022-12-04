<template>
  <section class="history">
    <h2>Mon historique</h2>
    <div class="lines">
      <Popover  v-for="trackHistory of history" placement="right" trigger="mouseenter">
        <template #trigger>
          <TitleInfosLine :trackId="trackHistory.trackId" :onlyImg="onlyImg"/>
        </template>
        <template #content>
          Joué le 
          {{dayjs(trackHistory.played_at).format('DD/MM/YYYY à HH:mm')}}
        </template>
      </Popover>
    </div>
  </section>
</template>

<script setup>
import History from '@clabroche/spotify-analyzer-models/src/models/History';
import {ref, onMounted, computed, onBeforeUnmount} from 'vue'
import TitleInfosLine from './TitleInfosLine.vue';
import Popover from './common/Popover.vue';
import dayjs from 'dayjs';
import Dictionnary from '../services/Dictionnary';
window.innerWidth
/** @type {import('vue').Ref<import('@clabroche/spotify-analyzer-models/src/models/History')[]>} */
const history = ref([])
const windowWidth = ref(window.innerWidth)
onMounted(async () => {
  history.value = await History.recentlyPlayed()
  History.updated.subscribe(async () => {
    history.value = await History.recentlyPlayed()
    history.value.map(h => Dictionnary.addTrack(h.trackId))
  })
})

const onResize = () => windowWidth.value = window.innerWidth
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

const onlyImg = computed(() => windowWidth.value < 800 ? true : false)

</script>

<style lang="scss" scoped>
section:first-of-type {
  margin-top: 0 !important;
}
.history {
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  height: 100%;
  overflow: hidden;
  background-color: #fff;
  width: 300px;
  border-right: 1px solid #ddd;
  box-shadow: 0 0 10px 0 #ddd;

  h2 {
    margin-top: 0;
  }
}

.lines {
  height: 100%;
  gap: 10px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
@media (max-width: 800px) {
  .history {
    width: 90px;
    padding: 0;
    justify-content: center;
  }

  h2 {
    display: none;
  }

}
</style>