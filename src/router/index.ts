import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/heroes",
      name: "heroes",
      // route level code-splitting
      // this generates a separate chunk (HeroesView.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/HeroesView.vue"),
    },
    {
      path: "/formations",
      name: "formations",
      component: () => import("../views/FormationView.vue"),
    },
    {
      path: "/abex",
      name: "abex",
      component: () => import("../views/AbexView.vue"),
    },
    {
      path: "/si40",
      name: "si40",
      component: () => import("../views/Si40View.vue"),
    },
  ],
});

export default router;
