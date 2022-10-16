<template>
  <div
    class="spinner"
    v-if="display"
    :style="{
      width: size + 'px',
      height: size + 'px',
    }"
  ></div>
</template>

<script>
export default {
  props: {
    display: {
      type: Boolean,
      default: true,
    },
    size: {
      default: "70",
    },
  },
};
</script>
<style scoped lang="scss">
$color: var(--primary-color);
.spinner {
  border: 3px solid $color;
  width: 70px;
  height: 70px;
  box-sizing: border-box;
  border-radius: 100%;
  border-bottom-color: transparent;
  animation-name: spin;
  animation-duration: 0.8s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  position: relative;
  display: flex;
  transform: translateZ(0);

  &::before {
    content: " ";
    animation-name: pulse;
    animation-duration: 0.8s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    background-color: $color;
    position: absolute;
    border-radius: 100%;
    margin-left: 50%;
    margin-top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  &::after {
    content: " ";
    width: 30%;
    height: 30%;
    background-color: $color;
    position: absolute;
    border-radius: 100%;
    margin-left: 50%;
    margin-top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
}

@keyframes spin {
  0% {
    transform: rotateZ(360deg);
  }

  100% {
    transform: rotateZ(0deg);
  }
}

@keyframes pulse {
  0% {
    width: 0%;
    height: 0%;
    opacity: 1;
  }

  100% {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>