<template>
  <div v-if="percentage !== null">
    <section>
      <svg viewBox="0 0 36 36">
        <path d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#195267" stroke-width="2"
                  stroke-linecap="round" 
          :stroke-dasharray="`50, 100`" />
        <path d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#79bad2" stroke-width="1"
                  stroke-linecap="round" 
          :stroke-dasharray="`${percentage}, 100`" />
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
  width: 100%;
  position: relative;
  overflow: hidden;
  height: 50%;
}
svg {
  width: 100%;
  height: 200%;
  transform: rotateZ(-90deg);
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
