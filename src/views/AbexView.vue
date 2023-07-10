<template>
  <div class="my-12 d-flex flex-column align-center">
    <h1 class="mb-8 text-h3 text-center">Boss Attack Reset<br />Calculator</h1>

    <div class="page-container">
      <v-form v-if="page === 1">
        <v-select v-model="season" label="Season" :items="seasons" disabled />
        <!-- TODO: min 0, max 10 -->
        <v-text-field
          v-model.number="spectators"
          class="required"
          label="Spectators"
          type="number"
          data-test="spectators"
        >
          <template #append-inner>
            <InformationIcon
              text="Militia members accrue stamina 1.2% faster per spectator"
            />
          </template>
        </v-text-field>
        <!-- TODO: Only allow positive integers -->
        <v-text-field
          v-model.number="stamina"
          class="required"
          label="Stamina"
          type="number"
        >
          <template #append-inner>
            <InformationIcon
              text="The stamina for the hero with the least amount in the team"
            />
          </template>
        </v-text-field>
        <v-checkbox
          v-model="isSod"
          label="I am a spectated SoD"
          color="primary"
          data-test="spectated"
        >
          <template #append>
            <InformationIcon
              text="Spectated stars of dawn accrue stamina 10% faster"
            />
          </template>
        </v-checkbox>

        <!-- TODO: Build theming into all VBtn -->
        <v-btn
          class="w-100 rounded-theme"
          size="large"
          variant="flat"
          color="primary"
          @click="page = 2"
        >
          Calculate
        </v-btn>
      </v-form>

      <div v-if="page === 2">
        <div class="mb-4">
          <p class="mb-4">
            There are
            <strong>{{ Math.floor(hoursLeft) }} hours left</strong>
            before quiet time starts.
          </p>
          <p class="mb-4">
            Your team will accrue {{ Math.floor(staminaToGain) }} more stamina
            from now and have a total of {{ totalStamina }} stamina, and will
            therefore have <strong>{{ remainingFullAttacks }} attacks</strong>.
          </p>
          <p class="mb-4">
            The attacks will use a total of
            {{ remainingFullAttackStamina }} stamina,
            <strong
              >leaving
              {{ totalStamina - remainingFullAttackStamina }} stamina </strong
            >.
          </p>
          <p class="mb-8 text-h6">
            Since each rewind costs 4 stamina, you can therefore
            <strong>rewind {{ freeRewinds }} times</strong> without losing an
            attack!
          </p>
        </div>

        <v-btn
          class="w-100 rounded-theme"
          size="large"
          variant="tonal"
          color="primary"
          @click="page = 1"
        >
          Back
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { DateTime } from "luxon";
import InformationIcon from "@/components/InformationIcon.vue";

const page = ref(1);

// Inputs
const seasons = [
  {
    title: "S9",
    // Convert titles to kebab-case for values
    value: "s9",
    quietTimeStartDate: DateTime.fromISO("2023-05-22T00:00Z"),
  },
  {
    title: "S10",
    value: "s10",
    quietTimeStartDate: DateTime.fromISO("2023-07-23T00:00Z"),
  },
];
const season = ref(seasons[seasons.length - 1]);

const spectators = ref(0);
const stamina = ref(0);
const isSod = ref(false);

// Results
const hoursLeft = computed(() =>
  season.value.quietTimeStartDate.diff(DateTime.now()).as("hours")
);
const staminaToGain = computed(() => {
  let adjustmentFactor = 1 + 0.012 * spectators.value;
  if (isSod.value) adjustmentFactor += 0.1;
  const staminaGain = 4 * adjustmentFactor;
  return hoursLeft.value > 0 ? staminaGain * hoursLeft.value : 0;
});
const totalStamina = computed(() =>
  Math.floor(stamina.value + staminaToGain.value)
);
const remainingFullAttacks = computed(() =>
  Math.floor(totalStamina.value / 48)
);
const remainingFullAttackStamina = computed(
  () => remainingFullAttacks.value * 48
);
const freeRewinds = computed(() => {
  const residualStamina = totalStamina.value % 48;
  return Math.floor(residualStamina / 4);
});
</script>

<style scoped>
.page-container {
  width: min(100%, var(--max-width));
}

strong {
  font-weight: bold;
  font-size: larger;
}

.v-checkbox :deep(.v-input__append) {
  margin-inline-end: 12px;
}
</style>
