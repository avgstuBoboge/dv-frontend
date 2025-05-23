import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from "./router.js";
import store from "./store.js";

async function bootstrap() {
    await store.dispatch('initData')
    console.log(store.state.data)
    const app = createApp(App);
    app.use(ElementPlus);
    app.use(router)
    app.use(store);
    store.commit('setRouter', router);
    app.mount('#app');
}

bootstrap();


