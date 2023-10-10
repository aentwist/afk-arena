<template>
  <header class="logo-container d-grid place-center">
    <div class="logo-helper">
      <span class="ders" :class="{ 'ders-sm': display.smAndUp.value }">
        Ders'
      </span>
      <img
        class="logo"
        src="@/assets/logo-upscaled-improved.webp"
        alt="AFK Arena"
      />
    </div>
  </header>

  <main class="mx-1">
    <section id="about" class="text-center">
      <h2 class="text-h5 text-sm-h4">Browser based tool for AFK Arena</h2>
      <p>
        Note: clearing website data for this domain will result in loss of data!
      </p>
    </section>
  </main>

  <footer class="px-1 px-sm-3 py-12 d-flex flex-column align-center">
    <span>
      Made with 🤍 by <span class="Ders" title="127576548">Ders</span>
    </span>
    <br />
    <span>
      Open source on
      <a
        href="https://github.com/aentwist/afk-arena"
        title="aentwist/afk-arena"
      >
        GitHub
      </a>
    </span>
    <br />
    <span>
      Powered by <a href="https://pages.cloudflare.com/">Cloudflare</a>
    </span>
  </footer>
</template>

<script setup lang="ts">
import { useDisplay } from "vuetify";

const display = useDisplay();
</script>

<style scoped>
.Ders:hover {
  cursor: pointer;
  text-decoration: underline;
}

.ders {
  position: absolute;
  top: -45px;
  left: 2%;
  transform: rotate(-15deg);
  font: 4em "Permanent Marker", Arial, sans-serif;
  color: rgb(var(--v-theme-primary));
  text-shadow: 2px 2px 2px rgb(var(--v-theme-on-surface));
}

.ders-sm {
  font-size: 5em;
}

footer {
  width: 100%;
  position: relative;
  bottom: 0;
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-surface));
}

.logo {
  width: 100%;
}

.logo-container {
  height: min(calc(100vh - 250px), 500px);
}

.logo-helper {
  width: min(100%, 500px);
  position: relative;
}

main {
  margin-bottom: 25%;
}
</style>
