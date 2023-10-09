<template>
  <div class="mx-1 mx-sm-0 my-12 d-flex flex-column align-center">
    <div class="mb-8 d-flex align-center">
      <h1 class="me-1 text-h4 text-md-h3 line-clamp-1">Attack Calculator</h1>
      <v-btn
        v-if="page > SETTINGS_PAGE"
        :icon="mdiCog"
        variant="plain"
        @click="page = SETTINGS_PAGE"
      />
    </div>

    <div class="page-container">
      <div v-if="page === WELCOME_PAGE">
        <h3 class="mb-8 text-h5 text-center">
          Welcome to AE {{ season.title }}!
        </h3>

        <!-- TODO: Build theming into all VBtn -->
        <v-btn
          class="w-100 rounded-theme"
          size="large"
          variant="flat"
          color="primary"
          @click="nextPage"
        >
          Get Started
        </v-btn>
      </div>

      <v-form v-if="page === SETTINGS_PAGE">
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
          @click="setSettings"
        >
          Next
        </v-btn>
      </v-form>

      <v-form v-if="page === CALC_PAGE">
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

        <!-- TODO: Build theming into all VBtn -->
        <v-btn
          class="w-100 rounded-theme"
          size="large"
          variant="flat"
          color="primary"
          @click="nextPage"
        >
          Calculate
        </v-btn>
      </v-form>

      <div v-if="page === RESULTS_PAGE">
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
          @click="prevPage"
        >
          Back
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { DateTime } from "luxon";
import InformationIcon from "@/components/InformationIcon.vue";
import { mdiCog } from "@mdi/js";

const S_KEY_NS = "abex:";

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
  // {
  //   title: "S11 Beta",
  //   value: "s11-beta",
  //   quietTimeStartDate: DateTime.fromISO("2023-07-23T00:00Z"),
  // },
];
const season = ref(seasons[seasons.length - 1]);
const settingsSeason = useLocalStorage(
  `${S_KEY_NS}settings-season`,
  season.value.value
);
const spectators = ref(0); // Default value just for type
const settingsSpectators = useLocalStorage(`${S_KEY_NS}settings-spectators`, 0);
const isSod = ref(false); // Default value just for type
const settingsIsSod = useLocalStorage(`${S_KEY_NS}settings-is-sod`, false);

const settingsComplete = useLocalStorage(`${S_KEY_NS}settings-complete`, false);
// If the season rolled, then reset the settings
if (settingsSeason.value !== season.value.value) {
  settingsSeason.value = season.value.value;
  settingsSpectators.value = 0;
  settingsIsSod.value = false;
  settingsComplete.value = false;
}
// Initialize the settings form
spectators.value = settingsSpectators.value;
isSod.value = settingsIsSod.value;

const WELCOME_PAGE = 1;
const SETTINGS_PAGE = 2;
const CALC_PAGE = 3;
const RESULTS_PAGE = 4;
const page = ref(settingsComplete.value ? CALC_PAGE : WELCOME_PAGE);
const nextPage = () => page.value++;
const prevPage = () => page.value--;

function setSettings() {
  // TODO: Validate settings page

  // Note that we only commit these settings on submit
  settingsSeason.value = season.value.value;
  settingsSpectators.value = spectators.value;
  settingsIsSod.value = isSod.value;
  settingsComplete.value = true;

  nextPage();
}

const stamina = ref(0);

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
