
<template>
  <div class="app-content">
    <div class="main">
      <HistorySection v-if="!['login', 'register'].includes($route.name)"/>
      <div class="router-container">
        <RouterView />
      </div>
    </div>
    <div class="bottom-bar" v-if="!['login', 'register'].includes($route.name)">
      <BottomBar></BottomBar>
    </div>
  </div>
  <notification></notification>
</template>

<script setup>
import { RouterView } from "vue-router";
import router from "./router";
import Auth from "./services/Auth";
import Notification from "./components/common/Notification.vue";
import notif from "./services/notification";
import BottomBar from "./components/common/BottomBar.vue";
import { core } from "@clabroche-org/spotify-analyzer-models/src/apis/Core";
import Credential from "@clabroche-org/spotify-analyzer-models/src/models/Credential";
import HistorySection from "./components/HistorySection.vue";
import {Socket} from '@clabroche-org/common-socket-front';
import History from "@clabroche-org/spotify-analyzer-models/src/models/History";

Auth.getUser()
  .then(async () => {
    const email = Auth.user.value?.email
    if (email) {
      Socket.init(email)
      Socket.socket.on("update:histories", () => {
        History.updated.next()
      })
    }
  })
core.errorObservable.subscribe(async err => {
  if (err?.response?.status === 401) {
    notif.next("error", "Vous n'êtes pas authentifié.");
    router.push({ name: "login" });
  }
  if (err?.response?.status === 441) {
    notif.next("error", "Non connecté à spotify.");
    const url = await Credential.getOauthUrl()
    document.location.href = url
  }
  console.error(err);
})


</script>

<style lang="scss">
@import "@/assets/theme/index";

#app {
  height: 100vh;
  font-size: 1rem;
}
</style>
<style scoped lang="scss">
  .app-content {
      box-sizing: border-box;  height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .bottom-bar {
    flex-shrink: 0;
  }
  
  .main {
    box-sizing: border-box;
    overflow: auto;
    flex-grow: 1;
    display: flex;
    .router-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
  }

  
</style>