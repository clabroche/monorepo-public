<template>
  <div class="root-bottom-bar">
    <button class="bordered">
    </button>
    <button class="bordered main" @click="$router.push({ name: 'home' })">
      <i class="fas fa-home"></i>
    </button>
    <button class="bordered" @click="disconnect">
      <i class="fas fa-unlink"></i>
    </button>
  </div>
</template>
<script setup>
import router from '../../router/index.js';
import Auth from '../../services/Auth.js';
import notification from '../../services/notification';

const disconnect = async () => {
  await Auth.disconnect()
  router.push({ name: 'login' })
}
const sync = async() => {
  notification.next('sucess', 'Synchronisation manuelle en cours...')
}
</script>
<style scoped lang="scss">
.root-bottom-bar {
  height: 50px;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  background-color: white;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  z-index: 2;
  position: relative;

  button {
    font-size: 20px;
    width: max-content;

    i {
      margin: 0;
    }

    &.main {
      font-size: 40px;
      transform: translateY(-20px);
      background-color: white;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
      border-radius: 500px;
    }
  }
}
</style>