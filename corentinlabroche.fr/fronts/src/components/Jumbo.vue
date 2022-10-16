<template>
  <div class="jumbo">
    <canvas ref="canvas"></canvas>
    <div id="logo" class="item">
      <img src="@/assets/img/mountains.svg" alt="">
    </div>
    <div class="waves">
      <div class="wave"></div>
      <div class="wave"></div>
    </div>
    <div class="goto-bottom left chevron" @click="previous">
      <font-awesome-icon :icon="['fas', 'chevron-left']" class="bottom chevron"/>
    </div>
    <div class="goto-bottom right chevron" @click="next">
      <font-awesome-icon :icon="['fas', 'chevron-right']" class="bottom chevron"/>
    </div>
    <transition name="slide-fade">
      <component :is="components[activeComponentIndex].comp"/>
    </transition>
    <div class="goto-bottom" @click="scroll">
      <label>Voir la suite</label>
      <font-awesome-icon :icon="['fas', 'chevron-down']" class="bottom chevron"/>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, defineAsyncComponent} from 'vue'
import Particles from './JumboComponents/backgrounds/Particles';
const canvas = ref(null)
onMounted(() => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
  }
  const particles = new Particles(canvas.value)
  particles.seed(1)
  function step() {
    particles.drawStars()
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})
const components = [
  {comp: defineAsyncComponent(() => import('./JumboComponents/Welcome.vue')), name: 'Welcome', duration: 4000, onlyOnce: true},  
  {comp: defineAsyncComponent(() => import('./JumboComponents/Weather.vue')), name: 'Weather', duration: 10000},  
]
const activeComponentIndex = ref(0)

const scroll = () => {
  document.querySelector('.main-container').scrollTo({top: window.innerHeight - 60, behavior: "smooth"})
}

const next = () => {
  activeComponentIndex.value = activeComponentIndex.value >= components.length - 1
      ? 0
      : activeComponentIndex.value + 1
}
const previous = () => {
  activeComponentIndex.value = activeComponentIndex.value <= 0
      ? components.length - 1
      : activeComponentIndex.value - 1
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.label {
  max-width: 100vw;
  z-index: 1;
  text-align: center;
  position: absolute;
  text-shadow: 5px 5px 23px var(--accent-color-light);
  color: white;
  font-size: 3.5em;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(255,255,255,0.1);
  background-color: var(--accent-color-transparent);
  border-radius: 10px;
  padding: 40px;
  box-sizing: border-box;
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.3);
}
  .jumbo {
    height: calc(100vh - 75px);
    background-color: #022b36;
    display: flex;
    overflow: hidden;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: 300ms;
    #logo {
      height: 100%;
      position: absolute;
      height: 100vh;
      width: 100vw;
      img {
        filter: brightness(0.9);
        height: 100%;
        width: 100%;
        object-fit: cover;
        object-position: left bottom;
      }
    }
    canvas {
      position: absolute;
    }
    
  }
  .chevron {
    width: 50px;
    height: 50px;
    padding: 10px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    font-size: 3em;
    color: white;
    text-shadow: 5px 5px 23px #000000;
    z-index: 1;
    transition: 300ms;
    cursor: pointer;
    &.left, &.right {
      position: absolute;
      top: 50%;
      z-index: 2;
      font-size: 3em;
    }
    &.left {
      left: 0;
    }

    &.right {
      right: 0;
    }
  }
  .goto-bottom {
    position: absolute;
    bottom: 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    animation-name: bounce;
    animation-duration: 10000ms;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    z-index: 1;
    label {
      opacity: 0;
      transition: 300ms;
      cursor: pointer;
    }
    &:hover {
      .bottom, label {
        background-color: var(--accent-color);
      }
      label {
        padding: 10px 40px;
        border-radius: 100px;
        transform: translateY(15px);
        font-size: 1.4em;
        box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.377);
        opacity: 1;
      }
      .bottom {
        width: 30px;
        height: 30px;
        box-shadow: 0 5px 10px 0 rgba(0, 0, 0, 0.377);
      }
    }
  }
  .slide-fade-enter-active, .slide-fade-leave-active {
    transition: all 0.5s ease;
  }
  .slide-fade-enter-from, .slide-fade-leave-to {
    transform: translateX(10px) scaleX(0);
    transform-origin: left;
    opacity: 0;
  }
  @keyframes bounce {
    0% {
      transform: translateY(0)
    }
    80% {
      transform: translateY(0)
    }
    90% {
      transform: translateY(10px)
    }
    100% {
      transform: translateY(0)
    }
  }

@media (max-width: 800px) {
  .label {
    font-size: 2em;
  }
}

.waves {
  width: 100vw;
  overflow: hidden;
}
.wave {
  background: url(/img/wave.svg) repeat-x; 
  position: absolute;
  bottom: 0;
  width: 6400px;
  height: 198px;
  animation: wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) infinite;
  transform: translate3d(0, 0, 0);
}

.wave:nth-of-type(2) {
  bottom: 10px;
  animation: wave 7s cubic-bezier( 0.36, 0.45, 0.63, 0.53) -.125s infinite, swell 6s ease -1.25s infinite;
  opacity: 1;
}


@keyframes wave {
  0% {
    margin-left: 0;
  }
  100% {
    margin-left: -1600px;
  }
}

@keyframes swell {
  0%, 100% {
    transform: scaleY(1.2);
  }
  50% {
    transform: scaleY(1);
  }
}
</style>

