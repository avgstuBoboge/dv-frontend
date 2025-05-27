import {createRouter, createWebHistory} from 'vue-router';
import OverView from "./components/OverView.vue";
import Ranking from "./components/Ranking.vue";
import RegionDetail from "./components/RegionDetail.vue";

const routes = [
    {path: '/', redirect: '/overview'},
    {path: '/overview', name: 'OverView', component: OverView},
    {path: '/ranking', name: 'Ranking', component: Ranking},
    {path: '/region/:id', name: 'RegionDetail', component: RegionDetail}
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;