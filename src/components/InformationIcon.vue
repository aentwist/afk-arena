<template>
  <v-tooltip v-model="show" location="bottom">
    <template #activator="{ props }">
      <v-icon
        :icon="mdiInformation"
        :size="size"
        v-bind="props"
        @click.stop="show = !show"
      />
    </template>
    <div>{{ text }}</div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { mdiInformation } from "@mdi/js";

defineProps<{
  text: string;
  // TODO: type
  size?: string;
}>();

const show = ref(false);
</script>
