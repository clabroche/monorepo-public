<template>
  <div class="progress-container">
    <span class="progress-label" v-if="!noLabel">0%</span>
    <div class="progress-box">
      <div class="progress" :style="{width: ((+value * 100 / max) * 100 / maxPercentInterval) + '%'}"></div>
    </div>
    <span class="progress-label" v-if="!noLabel">{{maxPercentInterval}}%</span>
  </div>
</template>

<script>
export default {
  props: {
    value: {default: 100, type: Number},
    max: {default: 100, type: Number},
    maxPercentInterval: { default: 100, type: Number },
    noLabel: {default: false, type: Boolean},
  }
}
</script>

<style lang="scss" scoped>
.progress-container {
  display: flex;
  align-items: center;
  flex-grow: 1;
  min-width: 60px;
  .progress-label {
    font-size: 0.8em;
  }
  .progress-box {
    width: 100%;
    height: 5px;
    border: 1px solid black;
    border-radius: 5px;
    margin: 0 5px;
    .progress {
      background-color: black;
      height: 100%;
    }
  }
}
.progress-percent {
  font-size: 1rem;
}
</style>