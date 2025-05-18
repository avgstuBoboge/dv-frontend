import {createStore} from 'vuex';

const store = createStore({
    state: () => ({
        router: null,
        selectedRegion: {
            id: null,
            name: null,
        }
    }),
    mutations: {
        setRouter(state, router) {
            state.router = router;
        },
    },
    actions: {}
})

export default store;