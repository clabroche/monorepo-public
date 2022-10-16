<template>
<transition name="list">
  <div class="root" v-if="projects.length">
    <h2>{{header}}</h2>
    <div class="cards">
        <card  v-for="project of projects" :key="project.header" :project="project"/>
    </div>
  </div>
</transition>
</template>

<script setup>
import Card from './Card.vue';

defineProps({
  header: String,
  projects: {default: []}
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.root {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  &:first-of-type {
    margin-top: 0;
  }
  h2 {
    margin-top: 0;
    width: 100%;
    font-weight: normal;
    font-size: 2em;
    margin-bottom: 20px;
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
    gap: 40px;
    width: 100%;
  }
}
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
  max-width: 0;
  overflow: hidden;
}

@media (max-width: 800px) {
  .root {
    .cards {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
}
</style>
