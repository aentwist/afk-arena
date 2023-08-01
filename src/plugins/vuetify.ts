import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as labsComponents from "vuetify/labs/components";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";

const vuetify = createVuetify({
  components: labsComponents,
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      mdi,
    },
  },
});

export default vuetify;
