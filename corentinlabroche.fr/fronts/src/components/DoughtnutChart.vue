<template>
  <div v-if="percentage !== null">
    <section>
      <svg width="160" height="160" xmlns="http://www.w3.org/2000/svg">
        <circle stroke="#195267" stroke-width="7" fill="none" cx="80" cy="80" r="60"/>
        <circle :class="'circle circle-anim-' + anim"
          stroke="#79bad2"
          stroke-width="7.3"
          :stroke-dasharray="(3.8 * percentage) + ' 380'"
          stroke-linecap="round" fill="none"
          cx="80" cy="80" r="60"/>
      </svg>
    </section>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue'
const props = defineProps({
  value: {
    type: Number
  }
})

const percentage = ref(null)
const anim = ref(1)

const calculatePercentage = value => {
  if(!props.value) return
  let newPercentage = (value * 100 / 200).toFixed(1)
  if (newPercentage !== percentage.value) {
    percentage.value = newPercentage
    if (anim.value === 1) {
      anim.value = 2
    } else {
      anim.value = 1
    }
  }
}

calculatePercentage(props.value)
watch(() => props.value, () => calculatePercentage(props.value))
</script>

<style scoped lang="scss">
section {
  display: inline-block;
  height: 80px;
  position: relative;
  overflow: hidden;
}
.circle {
  transform: rotate(-180deg);
  transform-origin: center;
  transition: 300ms;
}

.info {
  opacity: 1
}
</style>
