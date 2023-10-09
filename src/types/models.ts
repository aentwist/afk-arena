export interface Hero {
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

export interface Beast {
  name: string;
  tier: "rare" | "elite";
}

export interface Formation {
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
