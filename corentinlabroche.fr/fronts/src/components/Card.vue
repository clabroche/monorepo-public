<template>
  <div class="card">
    <div class="imgs">
      <img :src="project.img" alt="">
    </div>
    <div class="container">
      <div class="title">
          {{project.header}}
      </div>
      <div class="description">
          {{project.description}}
      </div>
      <div class="links" >
          <a v-for="(link, i) of project.links " :key="link.type+''+i" target="_blank" :href="link.url">
            <font-awesome-icon :icon="all[link.type]" />
          </a>
        </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from "vue"
defineProps({
  project: {default: () => ({})}
})
const all = ref({
  github: ['fab', 'github'],
  npm:[ 'fab', 'npm'],
  android: ['fab','android'],
  globe: ['fas','globe'],

})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

.card {
  display: flex;
  box-shadow: 0px 0px 8px 6px #0000002b;
  flex-shrink: 0;
  height: 250px;
  transition: 300ms;
  border-radius: 10px;
  align-items: center;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(120deg, var(--accent-color-lighter) 0%, var(--accent-color) 100%);
  &:hover {
    transform: scale(1.01)
  }
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    width: 100%;
    
  }
  .title {
    background-color: white;
    color: var(--accent-color);
    font-weight: bold;
    width: 100%;
    height: 50px;
    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
  }
  .imgs {
    width: 400px;
    height: 100%;
    object-fit: cover;
    position: relative;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    &::after {
      content: '';
      width: 50%;
      height: 50%;
      position: absolute;
      bottom: 0;
      right: 0;
      background-color: var(--accent-color);
      z-index: 0;
    }
    &::before {
      content: '';
      width: 50%;
      height: 50%;
      position: absolute;
      top: 0;
      right: 0;
      background-color: white;
      z-index: 0;
    }
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-fit: cover;
    z-index: 1;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0px 0px 20px 3px #2727278f;
    position: relative;
    border: 2px solid var(--accent-color);;
    box-sizing: border-box;

  }
  .description {
    text-align: center;
    top: 0;
    left: 0;
    height: 200px;
    width: 100%;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    box-sizing: border-box;
    transition: 300ms;
  }
  .links {
    height: 50px;
    width: 100%;
    top: 200px;
    transition: 800ms;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .links a{
    color: white;
    font-size: 2em;
    transition: 300ms;
    margin: 10px;
    height: 50px;
  }
}

@media (max-width: 800px) {
  .card {
    height: 300px;
    min-width: 200px;
    border: 2px solid #ffffff5e;
    .container {
      position: absolute;
      z-index: 1;
    }
    .title {
      font-size: 1.2em;
      height: 50px;
      color: white;
      z-index: 100;
    }
    .description, .title, .links {
      background-color: var(--accent-color-transparent);
    }
    .links {
      border-top: 1px solid rgba(255, 255, 255, 0.13);
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.432);
    }
    .imgs {
      width: 100%;
      &::after {
        border-width: 150px;
      }
    }
  }
}
</style>
