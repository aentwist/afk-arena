import type * as models from "@/types/models";
import { ref } from "vue";
import { defineStore } from "pinia";
import { type DBSchema, type IDBPDatabase, openDB } from "idb";

interface AfkArenaDB extends DBSchema {
  formations: {
    key: string;
    value: models.Formation;
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

export const useDbStore = defineStore("db", () => {
  const db = ref<IDBPDatabase<AfkArenaDB>>();
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
      db.value = val;
      init.value = true;
    })
    .catch((e) => (error.value = e));

  return {
    db,
    init,
    error,
  };
});
