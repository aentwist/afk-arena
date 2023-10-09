<template>
  <div v-if="error" class="h-75 d-grid place-center">
    <h2>Error connecting to database</h2>
    {{ error }}
  </div>
  <div v-else>
    <v-data-table
      v-model="selected"
      show-select
      :headers="headers"
      :items="Array.from(formationsById.values())"
      :row-height="83"
    >
      <template #top>
        <div class="ma-4 me-1 d-flex justify-space-between align-center">
          <h1 class="text-h4 text-md-h3">Formations</h1>
          <div>
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-btn
                  class="me-1"
                  :icon="mdiPlus"
                  variant="plain"
                  v-bind="props"
                  @click="showNewFormation = true"
                />
              </template>
              New Formation
            </v-tooltip>
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-btn
                  class="me-1"
                  :icon="mdiPencil"
                  variant="plain"
                  :disabled="selected.length !== 1"
                  v-bind="props"
                  @click="editSelected"
                />
              </template>
              Edit Selected
            </v-tooltip>
            <v-tooltip location="bottom">
              <template #activator="{ props }">
                <v-btn
                  :icon="mdiTrashCan"
                  variant="plain"
                  color="error"
                  :disabled="!selected.length"
                  v-bind="props"
                  @click="deleteSelected"
                />
              </template>
              Delete Selected
            </v-tooltip>
          </div>
        </div>
      </template>

      <template #item.position1="{ item }">
        <HeroIcon
          v-if="item.raw.position1"
          :name="item.raw.position1"
          ascension="ascended"
          :stars="5"
        />
      </template>
      <template #item.position2="{ item }">
        <HeroIcon
          v-if="item.raw.position2"
          :name="item.raw.position2"
          ascension="ascended"
          :stars="5"
        />
      </template>
      <template #item.position3="{ item }">
        <HeroIcon
          v-if="item.raw.position3"
          :name="item.raw.position3"
          ascension="ascended"
          :stars="5"
        />
      </template>
      <template #item.position4="{ item }">
        <HeroIcon
          v-if="item.raw.position4"
          :name="item.raw.position4"
          ascension="ascended"
          :stars="5"
        />
      </template>
      <template #item.position5="{ item }">
        <HeroIcon
          v-if="item.raw.position5"
          :name="item.raw.position5"
          ascension="ascended"
          :stars="5"
        />
      </template>
      <template #item.sp="{ item }">
        <HeroIcon
          v-if="item.raw.sp"
          :name="item.raw.sp"
          ascension="ascended"
          :stars="5"
        />
      </template>
      <template #item.beast="{ item }">
        <BeastIcon v-if="item.raw.beast" :name="item.raw.beast" />
      </template>
    </v-data-table>

    <v-dialog
      v-model="showNewFormation"
      fullscreen
      transition="dialog-bottom-transition"
    >
      <v-card class="overflow-y-hidden">
        <v-toolbar color="primary">
          <v-btn :icon="mdiClose" dark @click="closeNewFormation" />
          <v-toolbar-title class="text-center">New Formation</v-toolbar-title>
          <v-toolbar-items>
            <v-btn
              variant="text"
              @click="formationToUpdate ? updateFormation() : saveFormation()"
              >Save</v-btn
            >
          </v-toolbar-items>
        </v-toolbar>

        <v-form>
          <div
            class="new-formation-top mx-auto my-12 d-flex flex-column align-center"
          >
            <v-text-field
              v-model="name"
              class="new-formation-name"
              label="Name"
            />

            <div class="d-flex flex-wrap justify-space-between">
              <UnitSelect
                v-for="i in 5"
                :key="i"
                v-model="heroes[i - 1]"
                class="me-1"
                type="hero"
                :label="`Position ${i}`"
                :selected="unitSelectIndex === i - 1"
                @update:selected="unitSelectIndex = i - 1"
              />

              <UnitSelect
                v-model="sp"
                class="me-1"
                type="hero"
                label="SP"
                :selected="unitSelectIndex === 5"
                @update:selected="unitSelectIndex = 5"
              />
              <UnitSelect
                v-model="beast"
                type="beast"
                label="Beast"
                :selected="unitSelectIndex === 6"
                @update:selected="unitSelectIndex = 6"
              />
            </div>
          </div>

          <div
            ref="drawer"
            class="border elevation-4 overflow-y-auto"
            :style="{
              height: `calc(${docClientHeight}px - ${drawerOffsetTop}px)`,
            }"
          >
            <!-- <v-toolbar class="drawer-toolbar">test</v-toolbar> -->

            <div
              class="unit-container"
              :class="[unitSelectIndex < 6 ? 'd-flex' : 'd-none']"
            >
              <HeroIcon
                v-for="(hero, i) in heroMetadata"
                :key="i"
                class="ma-1 cursor-pointer"
                :name="hero.name"
                ascension="ascended"
                :stars="5"
                :si="40"
                :f="36"
                :e="100"
                @click="selectUnit(hero.name)"
              />
            </div>
            <div
              class="unit-container"
              :class="[unitSelectIndex === 6 ? 'd-flex' : 'd-none']"
            >
              <BeastIcon
                v-for="(beast, i) in beastMetadata"
                :key="i"
                class="ma-1 cursor-pointer"
                :name="beast.name"
                @click="selectUnit(beast.name)"
              />
            </div>
          </div>
        </v-form>
      </v-card>
    </v-dialog>

    <v-snackbar :model-value="Boolean(message)">{{ message }}</v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import UnitSelect from "@/components/UnitSelect.vue";
import HeroIcon from "@/components/HeroIcon.vue";
import BeastIcon from "@/components/BeastIcon.vue";
import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import { mdiClose, mdiPencil, mdiPlus, mdiTrashCan } from "@mdi/js";

interface Hero {
  name: string;
  tier: "common" | "legendary" | "ascended";
  faction:
    | "lightbearer"
    | "mauler"
    | "wilder"
    | "graveborn"
    | "celestial"
    | "hypogean"
    | "dimensional";
  type: "strength" | "intelligence" | "agility";
  class?: "warrior" | "tank" | "ranger" | "mage" | "support";
  awakened?: true;
}

interface Beast {
  name: string;
  tier: "rare" | "elite";
}

interface Formation {
  id?: number;
  name?: string;
  position1?: string;
  position2?: string;
  position3?: string;
  position4?: string;
  position5?: string;
  sp?: string;
  beast?: string;
}

interface AfkArenaDB extends DBSchema {
  formations: {
    key: string;
    value: Formation;
  };
  // products: {
  //   value: {
  //     name: string;
  //     price: number;
  //     productCode: string;
  //   };
  //   key: string;
  //   indexes: { "by-price": number };
  // };
}

let db: IDBPDatabase<AfkArenaDB>;
const init = ref(false);
const error = ref<Error>();
openDB<AfkArenaDB>("afk_arena", 1, {
  upgrade(database, oldVersion, newVersion, transaction, event) {
    console.log(arguments);
    database.createObjectStore("formations", {
      keyPath: "id",
      autoIncrement: true,
    });
  },
})
  .then((val) => {
    db = val;
    init.value = true;
  })
  .catch((e) => (error.value = e));

const message = ref("");
function snackbar(msg: string): void {
  message.value = msg;
  setTimeout(() => (message.value = ""), 3000);
}

const heroMetadata = ref<Hero[]>();
fetch(
  "https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/data/heroes.json"
).then(async (response) => {
  if (response.ok) {
    heroMetadata.value = await (response.json() as Promise<Hero[]>);
  }
});
const beastMetadata = ref<Beast[]>();
fetch(
  "https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/data/beasts.json"
).then(async (response) => {
  if (response.ok) {
    beastMetadata.value = await (response.json() as Promise<Beast[]>);
  }
});

const headers = [
  { title: "Name", key: "name" },
  { title: "Position 1", key: "position1" },
  { title: "Position 2", key: "position2" },
  { title: "Position 3", key: "position3" },
  { title: "Position 4", key: "position4" },
  { title: "Position 5", key: "position5" },
  { title: "SP", key: "SP" },
  { title: "Beast", key: "beast" },
];

const formationsById = reactive(new Map<number, Formation>());
watch(init, async () => {
  const formations = await db.getAll("formations");
  formations.forEach((formation) =>
    formationsById.set(formation.id, formation)
  );
});

const selected = ref<number[]>([]);

const formationToUpdate = ref<number>();
function editSelected() {
  const formationId = selected.value[0];
  formationToUpdate.value = formationId;
  const formation = formationsById.get(formationId);

  name.value = formation?.name;
  for (let i = 0; i < heroes.length; i++) {
    heroes[i] = formation[`position${i + 1}`];
  }
  sp.value = formation?.sp;
  beast.value = formation?.beast;

  unitSelectIndex.value = findNextOpen();

  showNewFormation.value = true;
}

async function deleteSelected() {
  const tx = db.transaction("formations", "readwrite");
  const result = await Promise.all([
    ...selected.value.map((id) => tx.store.delete(id)),
    tx.done,
  ]);
  snackbar("Formations deleted!");

  selected.value.forEach((id) => formationsById.delete(id));

  return result;
}

const showNewFormation = ref(false);
const drawer = ref<HTMLElement>();
const docClientHeight = document.documentElement.clientHeight;
const drawerOffsetTop = computed(() => drawer.value?.offsetTop);

const name = ref<string>();
const heroes = reactive<Array<undefined | string>>(
  new Array(5).fill(undefined)
);
const sp = ref<string>();
const beast = ref<string>();
const unitSelectIndex = ref(0);
const findNextOpen = () =>
  [...heroes, sp.value, beast.value].findIndex((elt) => !elt);

function selectUnit(name: string) {
  if (unitSelectIndex.value < 5) {
    heroes[unitSelectIndex.value] = name;
  } else if (unitSelectIndex.value === 5) {
    sp.value = name;
  } else if (unitSelectIndex.value === 6) {
    beast.value = name;
  }

  if (unitSelectIndex.value < 0) {
    snackbar("Formation is full. Select units to remove.");
  }
  const nextOpen = findNextOpen();
  if (nextOpen < 0) {
    unitSelectIndex.value = -1;
  } else {
    unitSelectIndex.value = nextOpen;
  }
}

function closeNewFormation() {
  showNewFormation.value = false;

  name.value = undefined;
  for (let i = 0; i < heroes.length; i++) heroes[i] = undefined;
  sp.value = undefined;
  beast.value = undefined;

  unitSelectIndex.value = 0;
}

async function saveFormation() {
  const newFormation: Formation = {
    name: name.value,
    position1: heroes[0],
    position2: heroes[1],
    position3: heroes[2],
    position4: heroes[3],
    position5: heroes[4],
    sp: sp.value,
    beast: beast.value,
  };

  const idStr = await db.put("formations", newFormation);
  const id = Number(idStr);
  formationsById.set(id, {
    ...newFormation,
    id,
  });
  closeNewFormation();
  snackbar("Formation saved!");
}

async function updateFormation() {
  const updatedFormation: Formation = {
    id: formationToUpdate.value,
    name: name.value,
    position1: heroes[0],
    position2: heroes[1],
    position3: heroes[2],
    position4: heroes[3],
    position5: heroes[4],
    sp: sp.value,
    beast: beast.value,
  };

  await db.put("formations", updatedFormation);
  formationsById.set(formationToUpdate.value, updatedFormation);

  formationToUpdate.value = undefined;
  selected.value = [];

  closeNewFormation();
  snackbar("Formation updated!");
}
</script>

<style scoped>
.drawer-toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
}

.new-formation-name {
  width: 100%;
}

.new-formation-top {
  width: fit-content;
}

:deep(tbody tr) {
  height: 83px;
}

.unit-container {
  margin: 4px auto;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
</style>
