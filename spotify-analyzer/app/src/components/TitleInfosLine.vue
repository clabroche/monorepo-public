<template>
  <Line
    :img="album?.images?.[0]?.url"
    :infos="!onlyImg ? [
      ...additionalInfos,
      { icon: 'fas fa-user', text: artist?.name },
      { icon: 'fas fa-music', text: track?.name }
    ] : []"
    />

</template>

<script setup>
import {defineProps, computed, onMounted} from 'vue'
import Dictionnary from '../services/Dictionnary';
import Line from './Line.vue';

const props = defineProps({
  trackId: { required: true, type: String },
  onlyImg: { type: Boolean, default: false },
  additionalInfos: {
    /**@type {{icon:string, text: string}[]} */
    default: []
  }
})

onMounted(async () => {
  await Dictionnary.addTrack(props.trackId)
})

/** @type {import('vue').Ref<import('@clabroche/spotify-analyzer-models/src/models/Track')>} */
const track = computed(() => Dictionnary.tracks.value[props.trackId])
/** @type {import('vue').Ref<import('@clabroche/spotify-analyzer-models/src/models/Album')>} */
const album = computed(() => Dictionnary.albums.value[track.value?.albumId])
/** @type {import('vue').Ref<import('@clabroche/spotify-analyzer-models/src/models/Artist')>} */
const artist = computed(() => Dictionnary.artists.value[track.value?.artistsIds?.[0]])


const infos = computed(() => {
  return 

})
</script>

<style lang="scss" scoped>
</style>