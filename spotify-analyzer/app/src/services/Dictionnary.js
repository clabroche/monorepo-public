import {watch, ref, computed} from 'vue'
import Album from '@clabroche-org/spotify-analyzer-models/src/models/Album'
import Artist from '@clabroche-org/spotify-analyzer-models/src/models/Artist'
import Track from '@clabroche-org/spotify-analyzer-models/src/models/Track'
import debounce from 'debounce'

/** @type {import('vue').Ref<Object<string, import('@clabroche-org/spotify-analyzer-models/src/models/Artist')>>} */
const artists = ref({})
/** @type {import('vue').Ref<string[]>} */
const artistsId = ref([])

/** @type {import('vue').Ref<Object<string, import('@clabroche-org/spotify-analyzer-models/src/models/Album')>>} */
const albums = ref({})
/** @type {import('vue').Ref<string[]>} */
const albumsId = ref([])

/** @type {import('vue').Ref<Object<string, import('@clabroche-org/spotify-analyzer-models/src/models/Track')>>} */
const tracks = ref({})
/** @type {import('vue').Ref<string[]>} */
const tracksId = ref([])

const addArtist = async(..._artistsIds) => {
  const curatedArtistIds = _artistsIds.filter(artistsId => !artists.value[artistsId] && artistsId)
  artistsId.value.push(...curatedArtistIds)
}
const addAlbum = async(..._albumsIds) => {
  const curatedAlbumIds = _albumsIds.filter(albumId => !albums.value[albumId] && albumId)
  albumsId.value.push(...curatedAlbumIds)
}
const addTrack = async(..._tracksIds) => {
  const curatedTrackIds = _tracksIds.filter(trackId => !tracks.value[trackId] && trackId)
  tracksId.value.push(...curatedTrackIds)
}
export default {
  artists,albums,tracks,
  addArtist, addAlbum, addTrack
}

watch(() => tracksId, debounce(async  () => {
  if(!tracksId.value?.length) return
  const curatedTrackIds = tracksId.value
  tracksId.value = []
  const newTracks = await Track.all({
    _id: { $in: curatedTrackIds }
  })
  newTracks.forEach(t => tracks.value[t._id] = t)
  await addAlbum(...newTracks.map(tr => tr.albumId))
  await addArtist(...newTracks.map(tr => tr.artistsIds[0]))
}, 100), {deep: true})

watch(() => albumsId.value, debounce(async () => {
  if(!albumsId.value?.length) return
  const curatedAlbumIds = albumsId.value
  albumsId.value = []
  const newAlbums = await Album.all({
    _id: { $in: curatedAlbumIds }
  })
  newAlbums.forEach(a => albums.value[a._id] = a)
}, 100), {deep: true})

watch(() => artistsId.value, debounce(async () => {
  if(!artistsId.value?.length) return
  const curatedArtitstIds = artistsId.value
  artistsId.value = []
  const newArtists = await Artist.all({
    _id: { $in: curatedArtitstIds }
  })
  newArtists.forEach(a => artists.value[a._id] = a)
}, 100), {deep: true})
