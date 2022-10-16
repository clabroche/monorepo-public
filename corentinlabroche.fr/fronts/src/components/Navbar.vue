<template>
  <div id="navbar-shifter"></div>
  <div id="navbar">
    <div class="left">
      <div id="logo" class="item" @click="$router.push({ name: 'home'})">
        <img :style="{width: '100%'}" src="@/assets/img/logo.svg" alt="">
      </div>
    </div>
    <div class="right">
      <!-- <div class="item">
        <a @click="$router.push({name: 'blog'})">
          Articles
        </a>
      </div> -->
      <div class="item">
        <a target="_blank" href="https://github.com/clabroche/">
          <font-awesome-icon :icon="['fab', 'github']" class="bottom chevron" />
        </a>
      </div>
      <div class="item">
        <a target="_blank" href="https://www.npmjs.com/~iryu54/">
          <font-awesome-icon :icon="['fab', 'npm']" class="bottom chevron" />
        </a>
      </div>
      <div class="item">
        <a target="_blank" href="mailto:corentinlabroche@gmail.com">
          <font-awesome-icon :icon="['fas', 'envelope']" class="bottom chevron" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#navbar-shifter {
  height: 75px;
}
#navbar {
  box-sizing: border-box;
  color: white;
  display: flex;
  align-items: center;
  font-size: 1.2em;
  justify-content: space-between;
  z-index: 101;
  width: 100vw;
  height: 75px;
  position: fixed;
  top: 0;
  backdrop-filter: blur(10px);
  background-color: rgba(0,0,0,0.2);
  box-shadow: 0 0 11px 0px black;
  a {
    color: white;
  }
}
#navbar .left {
  height: 100%;
  display: flex;
  align-items: center;
  border-bottom-right-radius: 10px;
  padding-right: 20px;
  #logo {
    height: 100%;
    cursor: pointer;
    img {
      height: 100%;
      width: 100%;
      mask-image: linear-gradient(to bottom, rgba(0,0,0,1), rgba(255,255,255,0.8));
      object-fit: cover;
      object-position: left bottom;
    }
  }
}

#navbar .right {
  display: flex;
  align-items: center;
  border-bottom-left-radius: 10px;
  height: 100%;
  .item {
    margin: 10px;
    cursor: pointer;
    transition: 300ms;
    font-size: 1.8em;
    &:hover {
      transform: scale(1.2)
    }

  }
}
@media (max-width: 800px) {
  #navbar .right .item {
    font-size: 1.5em;
  }
}

</style>
