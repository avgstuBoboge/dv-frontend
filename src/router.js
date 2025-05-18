import {createRouter, createWebHistory} from 'vue-router';
import OverView from "./components/OverView.vue";
import Ranking from "./components/Ranking.vue";

const routes = [
    {path: '/', redirect: '/overview'},
    {path: '/overview', name: 'OverView', component: OverView},
    {path: '/ranking', name: 'Ranking', component: Ranking}
];

const router = createRouter({
    history: createWebHistory('/com-480-project-Ficciones/'),
    routes,
});

export default router;