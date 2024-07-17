<template>
  <v-alert
    v-model="showQuietTimeWarning"
    type="warning"
    :text="`Quiet Time starts ${quietTimeStartDateAgo}`"
    closable
  />

  <div class="d-flex flex-column align-center">
    <div
      class="ma-4 me-1 d-flex flex-grow-1 justify-space-between align-center"
    >
      <h1 class="me-1 text-h4 text-md-h3 line-clamp-1">Attack Calculator</h1>
      <ToolbarActions v-if="page > SETTINGS_PAGE" :actions="toolbarActions" />
    </div>

    <div :class="[page === CALC_PAGE ? 'w-100' : 'w-max-width']">
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

      <div v-if="page === CALC_PAGE">
        <v-table
          class="mb-4"
          :headers="headers"
          :items="items"
          :items-per-page="-1"
        >
          <thead>
            <tr>
              <th
                v-for="header in headers"
                :key="header.key"
                class="text-no-wrap"
              >
                {{ header.title }}
                <InformationIcon
                  v-if="header.key === 'stamina'"
                  text="The stamina for the hero with the least amount in the team"
                  size="small"
                />
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, i) in items" :key="i">
              <td class="pa-0 col-group-end">
                <v-text-field
                  v-model.number="item.formation"
                  class="required"
                  type="text"
                  hide-details
                />
              </td>
              <td class="pa-0 col-group-end">
                <!-- TODO: Only allow positive integers -->
                <v-text-field
                  v-model.number="item.stamina"
                  class="required"
                  type="number"
                  hide-details
                />
              </td>
              <td>
                <div class="d-flex align-center">
                  {{ item.attacks }}
                  <v-btn
                    size="small"
                    variant="flat"
                    :icon="mdiMinus"
                    :disabled="item.stamina < STAMINA_PER_ATTACK"
                    @click="item.stamina -= STAMINA_PER_ATTACK"
                  />
                </div>
              </td>
              <td class="col-group-end">
                <div class="d-flex align-center">
                  {{ item.rewinds }}
                  <v-btn
                    size="small"
                    variant="flat"
                    :icon="mdiMinus"
                    :disabled="item.stamina < STAMINA_PER_ATTACK"
                    @click="item.stamina -= STAMINA_PER_REWIND"
                  />
                </div>
              </td>
              <td class="pa-0 col-group-end">
                <!-- TODO: Validate -->
                <v-text-field
                  v-model.number="item.damagePerAttack"
                  type="number"
                  hide-details
                />
              </td>
              <td>{{ item.damage }}</td>
            </tr>
          </tbody>

          <tfoot>
            <tr>
              <th class="col-group-end"><strong>Total</strong></th>
              <td class="col-group-end">{{ totalStamina }}</td>
              <td>{{ totalAttacks }}</td>
              <td class="col-group-end">{{ totalRewinds }}</td>
              <td class="col-group-end highlight">
                {{ totalDamagePerAttack }}
              </td>
              <td class="highlight">{{ totalDamage }}</td>
            </tr>
          </tfoot>
        </v-table>

        <v-dialog v-model="showNewCompForm">
          <v-card>
            <v-toolbar color="primary">
              <v-btn :icon="mdiClose" @click="showNewCompForm = false" />
              <v-toolbar-title class="text-center">New Comp</v-toolbar-title>
              <v-toolbar-items>
                <v-btn variant="text" @click="saveNewComp">Save</v-btn>
              </v-toolbar-items>
            </v-toolbar>

            <section class="mt-3 mx-1">
              <v-text-field
                v-model="newCompFormation"
                type="text"
                label="Formation"
                autofocus
              />
              <v-text-field
                v-model.number="newCompStamina"
                type="number"
                label="Stamina"
              />
              <v-text-field
                v-model.number="newCompDamagePerAttack"
                type="number"
                label="Damage per Attack (B)"
              />
            </section>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolbarAction } from "@/types";
import { type ComputedRef, computed, reactive, type Ref, ref } from "vue";
import { useDisplay } from "vuetify";
import { useLocalStorage, useTimeAgo } from "@vueuse/core";
import { DateTime } from "luxon";
import InformationIcon from "@/components/InformationIcon.vue";
import ToolbarActions from "@/components/ToolbarActions.vue";
import { mdiClose, mdiCog, mdiMinus, mdiPlus } from "@mdi/js";

const S_KEY_NS = "abex:";

const display = useDisplay();

// Settings
// Seasons usually start on Saturday or Sunday at 12am UTC. They run for 16
// days. Of those, the last day is quiet time - stamina is only accumulated for
// the first 15.
const seasons = [
  {
    title: "S9",
    value: "s9",
    quietTimeStartDate: DateTime.fromISO("2023-05-22T00:00Z"),
  },
  {
    title: "S10",
    value: "s10",
    quietTimeStartDate: DateTime.fromISO("2023-07-23T00:00Z"),
  },
  {
    title: "S11 Beta",
    value: "s11b",
    quietTimeStartDate: DateTime.fromISO("2023-10-30T00:00Z"),
  },
  {
    title: "S11",
    value: "s11",
    quietTimeStartDate: DateTime.fromISO("2024-01-28T00:00Z"),
  },
  {
    title: "S12",
    value: "s12",
    quietTimeStartDate: DateTime.fromISO("2024-04-07T00:00Z"),
  },
  {
    title: "S13 Beta",
    value: "s13b",
    quietTimeStartDate: DateTime.fromISO("2024-07-28T00:00Z"),
  },
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
const page = ref(settingsComplete.value ? CALC_PAGE : WELCOME_PAGE);
const nextPage = () => page.value++;

function setSettings() {
  // TODO: Validate settings page

  // Note that we only commit these settings on submit
  settingsSeason.value = season.value.value;
  settingsSpectators.value = spectators.value;
  settingsIsSod.value = isSod.value;
  settingsComplete.value = true;

  nextPage();
}

// Calculator
// Givens
const STAMINA_PER_HOUR = 4;

const hoursLeft = computed(() =>
  season.value.quietTimeStartDate.diff(DateTime.now()).as("hours")
);
const staminaToGain = computed(() => {
  let adjustmentFactor = 1 + 0.012 * spectators.value;
  if (isSod.value) adjustmentFactor += 0.1;
  const staminaGain = STAMINA_PER_HOUR * adjustmentFactor;
  return hoursLeft.value > 0 ? staminaGain * hoursLeft.value : 0;
});

// Quiet time warning
const showQuietTimeWarning = ref(Boolean(hoursLeft.value < 48));
const quietTimeStartDateAgo = useTimeAgo(
  season.value.quietTimeStartDate.toJSDate(),
  {
    showSecond: true,
    rounding: "ceil",
    updateInterval: 1_000,
  }
);

// Calculations
const STAMINA_PER_ATTACK = 48;
const STAMINA_PER_REWIND = 4;

const getTotalStamina = (stamina: number) =>
  Math.floor(stamina + staminaToGain.value);
const getRemainingFullAttacks = (totalStamina: number) =>
  Math.floor(totalStamina / STAMINA_PER_ATTACK);
const getFreeRewinds = (totalStamina: number) => {
  const residualStamina = totalStamina % STAMINA_PER_ATTACK;
  return Math.floor(residualStamina / STAMINA_PER_REWIND);
};

// Computed factories
function attacks(stamina: Ref<number>) {
  return computed(() => {
    const totalStamina = getTotalStamina(stamina.value);
    return getRemainingFullAttacks(totalStamina);
  });
}
function rewinds(stamina: Ref<number>) {
  return computed(() => {
    const totalStamina = getTotalStamina(stamina.value);
    return getFreeRewinds(totalStamina);
  });
}
const damage = (attacks: ComputedRef<number>, damagePerAttack: Ref<number>) =>
  computed(() => attacks.value * damagePerAttack.value);

// Inputs / Results / Table
// TODO: db
interface Comp {
  formation: string; // TODO: make Formation
  stamina: number;
}
interface CompItem {
  formation: Ref<string>; //
  stamina: Ref<number>;
  attacks: ComputedRef<number>;
  rewinds: ComputedRef<number>;
  damagePerAttack: Ref<number>;
  damage: ComputedRef<number>;
}

const headers = [
  { title: "Formation", key: "formation" },
  { title: "Stamina", key: "stamina" },
  { title: "Attacks", key: "attacks" },
  { title: "Rewinds", key: "rewinds" },
  { title: "Damage per Attack (B)", key: "damagePerAttack" },
  { title: "Remaining Damage (B)", key: "damage" },
];

const initRowStamina = ref(80);
const initAttacks = attacks(initRowStamina);
const initDamagePerAttack = ref(10);
const items = reactive<CompItem[]>([
  {
    formation: ref("My Formation"),
    stamina: initRowStamina,
    attacks: initAttacks,
    rewinds: rewinds(initRowStamina),
    damagePerAttack: initDamagePerAttack,
    damage: damage(initAttacks, initDamagePerAttack),
  },
]);

const showNewCompForm = ref(false);
const newCompFormation = ref("");
const newCompStamina = ref(0);
const newCompDamagePerAttack = ref(0);
function saveNewComp() {
  // TODO: no db for now - just add the thing
  const stamina = ref(newCompStamina.value);
  const atks = attacks(stamina);
  const damagePerAttack = ref(newCompDamagePerAttack.value);
  items.push({
    formation: ref(newCompFormation.value),
    stamina: stamina,
    attacks: atks,
    rewinds: rewinds(stamina),
    damagePerAttack: damagePerAttack,
    damage: damage(atks, damagePerAttack),
  });

  // Handle the form
  showNewCompForm.value = false;
  newCompFormation.value = "";
  newCompStamina.value = 0;
  newCompDamagePerAttack.value = 0;
}

function total(field: string) {
  return computed(() => {
    let sum = 0;
    items.forEach((item) => void (sum += item[field]));
    return sum;
  });
}
const totalStamina = total("stamina");
const totalAttacks = total("attacks");
const totalRewinds = total("rewinds");
const totalDamagePerAttack = total("damagePerAttack");
const totalDamage = total("damage");

const toolbarActions: ToolbarAction[] = [
  {
    title: "New Comp",
    icon: mdiPlus,
    handler: () => void (showNewCompForm.value = true),
  },
  {
    title: "Settings",
    icon: mdiCog,
    handler: () => void (page.value = SETTINGS_PAGE),
  },
];
</script>

<style scoped>
.col-group-end {
  border-right: 1px solid rgb(var(--v-theme-on-surface-variant));
}

.highlight {
  background-color: rgba(var(--v-theme-primary), var(--v-idle-opacity));
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Remove spin buttons */
/* Chrome */
:deep(input::-webkit-outer-spin-button),
:deep(input::-webkit-inner-spin-button) {
  display: none;
}
/* Firefox */
:deep(input[type="number"]) {
  -moz-appearance: textfield;
}

strong {
  font-weight: bold;
  font-size: larger;
}

:deep(table) {
  border-collapse: collapse;
}

tfoot tr {
  border-top: medium solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.v-checkbox :deep(.v-input__append) {
  margin-inline-end: 12px;
}
</style>
