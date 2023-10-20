<template>
  <!-- Smaller devices: use an options menu -->
  <v-menu v-if="internalBreakpoint">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom">
        <template #activator="{ props: ttProps }">
          <v-btn
            class="me-1"
            :icon="mdiDotsVertical"
            variant="plain"
            v-bind="{ ...menuProps, ...ttProps }"
            @click="showOptions = true"
          />
        </template>
        Options
      </v-tooltip>
    </template>

    <v-card>
      <v-list>
        <v-list-item
          v-for="(action, i) in actions"
          :key="i"
          :disabled="action.disabled"
          @click="action.handler"
        >
          <template #prepend>
            <v-icon :icon="action.icon" v-bind="action.iconProps" />
          </template>
          <v-list-item-title>{{ action.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>

  <!-- Larger devices: expand the toolbar actions -->
  <div v-else>
    <v-tooltip v-for="(action, i) in actions" :key="i" location="bottom">
      <template #activator="{ props }">
        <v-btn
          class="me-1"
          icon
          variant="plain"
          :disabled="action.disabled"
          v-bind="props"
          @click="action.handler"
        >
          <v-icon :icon="action.icon" v-bind="action.iconProps" />
        </v-btn>
      </template>
      {{ action.title }}
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useDisplay } from "vuetify";
import { mdiDotsVertical } from "@mdi/js";

export interface ToolbarAction {
  title: string;
  icon: string;
  iconProps?: Record<string, string>;
  disabled?: boolean;
  handler: () => void | undefined;
}

const props = withDefaults(
  defineProps<{
    /**
     * Whether to use the version for small viewports
     *
     * Defaults to useDisplay().mobile
     */
    breakpoint?: boolean;
    actions: ToolbarAction[];
  }>(),
  { breakpoint: undefined }
);

const display = useDisplay();
const internalBreakpoint = computed(() =>
  props.breakpoint === undefined ? display.mobile.value : props.breakpoint
);

const showOptions = ref(false);
</script>
