<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-icon :icon="mdiInformation" v-bind="props" />
    </template>
    <div>{{ text }}</div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { mdiInformation } from "@mdi/js";

defineProps<{
  text: string;
}>();
</script>
