<template>
  <v-app>
    <v-main>
      <v-app-bar>
        <div
          class="w-100 d-flex align-center"
          :class="{ 'justify-space-between': display.mobile.value }"
        >
          <router-link class="home px-4" to="/">AFK Arena</router-link>

          <v-app-bar-nav-icon
            v-if="display.mobile.value"
            class="me-2"
            @click="showMobileNav = !showMobileNav"
          />
          <nav v-else>
            <v-tabs>
              <v-tab v-for="(tab, i) in tabs" :key="i" :to="tab.to">
                {{ tab.title }}
              </v-tab>
            </v-tabs>
          </nav>

          <v-dialog v-model="showMobileNav" fullscreen transition="none">
            <v-card>
              <v-toolbar color="primary">
                <div class="w-100 d-flex justify-space-between align-center">
                  <router-link class="home px-4" to="/">AFK Arena</router-link>
                  <v-btn
                    class="me-2"
                    :icon="mdiClose"
                    dark
                    @click="showMobileNav = false"
                  />
                </div>
              </v-toolbar>

              <nav>
                <v-list nav>
                  <v-list-item
                    v-for="(tab, i) in tabs"
                    :key="i"
                    :to="tab.to"
                    @click="showMobileNav = false"
                  >
                    {{ tab.title }}
                  </v-list-item>
                </v-list>
              </nav>
            </v-card>
          </v-dialog>
        </div>
      </v-app-bar>

      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDbStore } from "./stores/db";
import { useDisplay } from "vuetify";
import { mdiClose } from "@mdi/js";

useDbStore();

const display = useDisplay();

const tabs = [
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

const showMobileNav = ref(false);
</script>

<style scoped>
.home {
  text-decoration: none;
  color: inherit;
}
</style>
