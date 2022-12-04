<template>
  <div class="root label">
    <div class="texts">
      <div class="hello">Bonjour !</div>
      <h1>Je m'appelle <span><br>Corentin Labroche</span></h1>
      <p>
        Basé près de Nancy <img src="@/assets/img/french-logo.png">, je suis développeur web. <br>
        Je crée des sites et des applications basé sur les technologies web.
      </p>
    </div>
    <img class="logo" src="@/assets/img/activity.svg" alt="">
  </div>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.root {
  width: 90%;
  max-width: 1300px;
  text-align: left;
  justify-content: flex-start;
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: 90px;
  box-sizing: border-box;
  gap: 40px;
  flex-wrap: nowrap;
  .texts {
    text-align: left;
    font-size: 1rem;
    flex-grow: 1;
    width: 100%;
    .hello {
      font-size: 2em;
    }
    h1 {
      font-size: 3em;
      margin: 0;
      margin-bottom:30px;
      span{
        color: var(--accent-color-lighter);
      }
    }
    p {
      font-size: 1.2em;
    }
  }
}
.logo {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  border: 1px solid white;
  box-shadow: 0 0 10px 0 rgb(114, 114, 114);
  img {
    width: 100%;
  }
}
@media (max-width: 800px) {
  .root {
    .texts {
      font-size: 1rem;
      .hello {
        font-size: 1em;
      }
      h1 {
        font-size: 2em;
      }
    }
    .logo {
      display: none;
    }
  }
}
@media (max-width: 600px) {
}
</style>