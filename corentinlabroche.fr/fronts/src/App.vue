<template>
  <div id="app">
    <navbar></navbar>
    <div class="main-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue';

export default {
  components: {
    Navbar
  },
  setup() {
  }
}
</script>

<style lang="scss">
@import url('./assets/font/jost.css');

:root {
  --accent-color: #245c64;
  --accent-color-light: #3b7b85;
  --accent-color-lighter: #6aa9b3;
  --accent-color-transparent: #03434ddd;
}
body {
  display: inherit;
}
.main-container {
  height: 100vh;
  overflow-y: auto;
  position: relative;
}
/* width */
::-webkit-scrollbar {
  width: 11px;
}

/* Track */
::-webkit-scrollbar-track {
  background: rgba(0,0,0,0.1);
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 10px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.5);
}
.main-container {
  height: calc(100vh - 75px);
}
</style>
