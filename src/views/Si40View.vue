<template>
  <v-form>
    <section class="d-flex">
      <v-text-field v-model="reds" type="number" label="Number of red chests" />
      <v-text-field
        v-model="epics"
        type="number"
        label="Number of epic chests"
      />
    </section>

    <section class="d-flex align-center">
      <v-slider
        v-model="redsVsEpics"
        class="mx-6"
        label="Reds vs. Epics"
        step="1"
        min="0"
        max="10"
        thumb-label
        show-ticks
      />
      <v-table class="mb-6" density="compact">
        <thead>
          <th>Level</th>
        </thead>
        <tbody>
          <tr v-for="(level, i) in levelUpgrades" :key="level">
            <td :class="[level === Upgrade.EPIC ? 'epic' : 'red']">
              {{ i + 30 + 1 }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </section>

    <section class="d-flex">
      <v-text-field
        v-model="redUpgrades"
        label="Red upgrades"
        readonly
        hide-details
      />
      <v-text-field
        v-model="epicUpgrades"
        label="Epic upgrades"
        readonly
        hide-details
      />
    </section>
    <v-text-field
      :modelValue="totalUpgrades"
      label="Total upgrades"
      readonly
      hide-details
    />
    <section class="d-flex">
      <v-text-field
        v-model="leftoverReds"
        label="Red chests remaining"
        readonly
        hide-details
      />
      <v-text-field
        v-model="leftoverEpics"
        label="Epic chests remaining"
        readonly
        hide-details
      />
    </section>
  </v-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";

enum Upgrade {
  RED = "RED",
  EPIC = "EPIC",
}

const reds = ref(0);
const epics = ref(0);

const ORDER = [40, 39, 31, 37, 38, 36, 35, 32, 34, 33];
const levelUpgrades = reactive(new Array<Upgrade>(10));
for (let i = 0; i < levelUpgrades.length; i++) {
  levelUpgrades[i] = Upgrade.RED;
}
const redsVsEpics = ref(3);
watch(
  redsVsEpics,
  (newVal, oldVal) => {
    for (let i = oldVal || 0; i < newVal; i++) {
      levelUpgrades[ORDER[i] - 30 - 1] = Upgrade.EPIC;
    }
    for (let i = oldVal || -1; i >= newVal; i--) {
      levelUpgrades[ORDER[i] - 30 - 1] = Upgrade.RED;
    }
  },
  { immediate: true }
);

const RED_COSTS = [40, 45, 50, 60, 70, 80, 90, 100, 125, 160];
const EPIC_COSTS = [30, 40, 50, 55, 60, 65, 70, 80, 90, 110];

const redUpgrades = ref(0);
const epicUpgrades = ref(0);
const totalUpgrades = ref(0);
const leftoverReds = ref(0);
const leftoverEpics = ref(0);
watch([reds, epics, levelUpgrades], () => {
  let redCost = 0;
  let epicCost = 0;
  for (let i = 0; i < levelUpgrades.length; i++) {
    if (levelUpgrades[i] === Upgrade.RED) {
      redCost += RED_COSTS[i];
    } else {
      epicCost += EPIC_COSTS[i];
    }
  }

  redUpgrades.value = Math.floor(reds.value / redCost);
  epicUpgrades.value = Math.floor(epics.value / epicCost);
  totalUpgrades.value = Math.min(redUpgrades.value, epicUpgrades.value);

  leftoverReds.value = reds.value - totalUpgrades.value * redCost;
  leftoverEpics.value = epics.value - totalUpgrades.value * epicCost;
});
</script>

<style scoped>
.red {
  background: lightcoral;
}

.epic {
  background: lightskyblue;
}
</style>
