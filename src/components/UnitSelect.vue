<template>
  <div class="cursor-pointer" @click="selectAndUnslot">
    <div class="text-center text-subtitle-2">{{ label }}</div>
    <div
      class="icon d-grid place-center"
      :class="{ selected: selected, border: !modelValue }"
    >
      <v-icon
        v-if="!modelValue"
        :icon="mdiPlus"
        color="rgba(var(--v-border-color), var(--v-border-opacity))"
        size="x-large"
      />
      <HeroIcon
        v-else-if="type === 'hero'"
        :name="modelValue"
        ascension="ascended"
        :stars="5"
      />
      <BeastIcon v-else-if="type === 'beast'" :name="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { mdiPlus } from "@mdi/js";
import HeroIcon from "./HeroIcon.vue";
import BeastIcon from "./BeastIcon.vue";

defineProps<{
  modelValue: undefined | string;
  type: "hero" | "beast";
  label: string;
  selected: boolean;
}>();
const emit = defineEmits<{
  "update:modelValue": [name: undefined | string];
  "update:selected": [isSelected: boolean];
}>();

function selectAndUnslot() {
  emit("update:selected", true);
  emit("update:modelValue", undefined);
}
</script>

<style scoped>
.icon {
  width: 75px;
  height: 75px;
  border-radius: 25px 0;
  border-width: medium !important;
}

.selected {
  border-width: thick !important;
}
</style>
