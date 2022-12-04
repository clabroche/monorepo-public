import { createApp } from 'vue';
import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown, faChevronLeft, faChevronRight, faEnvelope, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { faAndroid, faNpm, faGithub } from '@fortawesome/free-brands-svg-icons'


library.add(
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faEnvelope,
  faGlobe,
  faAndroid,
  faNpm,
  faGithub
)

createApp(App)
  .component('font-awesome-icon', FontAwesomeIcon)
  .use(router)
  .mount('#app')
