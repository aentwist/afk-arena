<template>
  <div class="icon d-grid place-center border">
    <img
      class="beast"
      :src="`https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/beasts/lv18/${toKebabCase(
        name
      )}.png`"
      :alt="name"
    />
  </div>
</template>

<script setup lang="ts">
import { toKebabCase } from "@/util";

defineProps<{
  name: string;
}>();
</script>

<style scoped>
.beast {
  width: inherit;
  height: inherit;
  object-fit: cover;
  object-position: 0 0;
}

.icon {
  width: 75px;
  height: 75px;
  border-radius: 25px 0;
  border-width: medium !important;
  overflow: hidden;
}
</style>
