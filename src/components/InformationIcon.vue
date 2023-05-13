<template>
  <v-tooltip location="bottom">
    <template #activator="{ props }">
      <v-icon v-bind="props">mdi-information</v-icon>
    </template>
    <div>{{ text }}</div>
  </v-tooltip>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>
