<template>
<div class="root">
  <img class="logo" :src="img" alt="">
  <div class="infos">
    <div class="info-line" v-for="info of infos">
      <i :class="info?.icon"></i>
      {{info?.text}}
    </div>
  </div>
</div>
</template>

<script setup>
import {defineProps} from "vue"
defineProps({
  img: { type: String },
  infos: {
    /**@type {{text: string, icon: string}[]} */
    default: []
  },
})
</script>

<style lang="scss" scoped>
.root {
  display: flex;
  width: 100%;
  gap: 5px;
  position: relative;


  .infos {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0px;

    .info-line {
      display: flex;
      align-items: center;
      gap: 5px;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:last-of-type {
        font-weight: bold;
        color: #555;
      }

      &:first-of-type {
        font-size: 0.9em;
        color: #777;
      }

      i {
        width: 18px;
        height: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }

  .logo {
    height: 40px;
    width: 40px;
    border-radius: 50%;
  }
}
</style>