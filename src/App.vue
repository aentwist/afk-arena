<template>
  <v-app>
    <v-main>
      <v-app-bar>
        <div class="px-4">AFK Arena</div>
        <v-tabs>
          <v-tab v-for="(tab, i) in tabs" :key="i" :to="tab.to">
            {{ tab.title }}
          </v-tab>
        </v-tabs>
      </v-app-bar>

      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useDbStore } from "./stores/db";

useDbStore();

const tabs = [
  {
    to: "/",
    title: "Home",
  },
  {
    to: { name: "heroes" },
    title: "Heroes",
  },
  {
    to: { name: "formations" },
    title: "Formations",
  },
  {
    to: { name: "abex" },
    title: "Abyssal Expedition",
  },
];
</script>
