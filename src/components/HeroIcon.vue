<template>
  <div class="icon d-grid place-center">
    <img
      class="hero"
      :src="`https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/heroes/${toKebabCase(
        name
      )}.jpg`"
      :alt="name"
    />
    <div v-if="stars" class="stars-background"></div>
    <img
      class="borderr"
      src="https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/borders/ascended.png"
    />
    <img
      v-if="stars"
      class="stars"
      src="https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/stars/e100/5.png"
    />
    <img
      class="faction"
      src="https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/factions/lightbearer.png"
    />
    <img
      class="f"
      src="https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/f/36.png"
    />
    <img
      class="si"
      src="https://raw.githubusercontent.com/aentwist/afk-arena-resources/main/images/si/40.png"
    />
  </div>
</template>

<script setup lang="ts">
import { toKebabCase } from "@/util";

// https://stackoverflow.com/a/70307091/9890027
type Enumerate<
  N extends number,
  Acc extends number[] = []
> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

defineProps<{
  name: string;
  ascension:
    | "common"
    | "rare"
    | "rare+"
    | "elite"
    | "elite+"
    | "legendary"
    | "legendary+"
    | "mythic"
    | "mythic+"
    | "ascended";
  stars?: Range<1, 6>;
  si?: Range<0, 41>;
  f?: Range<1, 37>;
  e?: Range<1, 101>;
}>();
</script>

<style scoped>
.borderr {
  width: 75px;
  height: 75px;
  position: absolute;
}

.f {
  width: 20px;
  position: absolute;
  top: 20px;
  left: 2.75px;
}

.faction {
  width: 22px;
  position: absolute;
  top: 2px;
  left: 2px;
}

.hero {
  width: inherit;
  border-radius: 25px 0;
}

.icon {
  width: 75px;
  height: 75px;
  border-radius: 1em 0;
  position: relative;
}

.si {
  width: 32px;
  position: absolute;
  top: -2.5px;
  left: -3px;
}

.stars {
  width: calc(100% - 20px);
  position: absolute;
  bottom: 4px;
  left: 7px;
}

.stars-background {
  width: calc(100% - 2px);
  height: 18px;
  border-bottom-right-radius: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  background: black;
  opacity: 60%;
}
</style>
