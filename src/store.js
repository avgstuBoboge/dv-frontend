import {createStore} from 'vuex';

const date_types = ["GDP"]

const store = createStore({
    state: () => ({
        router: null,
        regionStack: [],
        comparing: false,
    }),
    mutations: {
        setRouter(state, router) {
            state.router = router;
        },
        pushRegion(state, region) {
            state.regionStack.push(region);
            // maintain only the last 2 regions
            if (state.regionStack.length > 2) {
                state.regionStack.shift();
            }
        },
    },
    actions: {}
})

export default store;