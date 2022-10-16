<template>
  <section class="history">
    <h2>Mon historique</h2>
    <div class="lines">
      <TitleInfosLine  v-for="trackHistory of history" :trackId="trackHistory.trackId"/>
    </div>
  </section>
</template>

<script setup>
import History from '@clabroche-org/spotify-analyzer-models/src/models/History';
import {ref, onMounted} from 'vue'
import TitleInfosLine from './TitleInfosLine.vue';

/** @type {import('vue').Ref<import('@clabroche-org/spotify-analyzer-models/src/models/History')[]>} */
const history = ref([])

onMounted(async () => {
  history.value = await History.recentlyPlayed()
})

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
</style>