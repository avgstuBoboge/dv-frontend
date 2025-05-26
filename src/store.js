import {createStore} from 'vuex';
import * as d3 from "d3";
import * as topojson from "topojson-client";

const topoData = await d3.json(import.meta.env.BASE_URL + "/geo/switzerland_cantons.geojson");
const objectKey = Object.keys(topoData.objects)[0];
const geoData = topojson.feature(topoData, topoData.objects[objectKey]);
const regions = geoData.features.map((region) => {
    return {
        id: region.id,
        name: region.properties.name
    };
});

const name2Region = {};
const id2Region = {};
regions.forEach((region) => {
    name2Region[region.name] = region;
    id2Region[region.id] = region;
});

name2Region["Zurich"] = name2Region["Zürich"];
name2Region["Bern"] = name2Region["Bern/Berne"];
name2Region["Berne"] = name2Region["Bern/Berne"];
name2Region["Lucerne"] = name2Region["Luzern"];
name2Region["Geneva"] = name2Region["Genève"];
name2Region["Graubünden"] = name2Region["Graubünden/Grigioni"];
name2Region["Valais"] = name2Region["Valais/Wallis"];
name2Region["Saint Gallen"] = name2Region["St. Gallen"];

const keywords = ["GDP", "language", "population", "religion", "social-condition"];
const subKeywords = {};

const modulesMap = {
    language: import.meta.glob(`/src/assets/data/language/*.tsv`, {as: 'raw'}),
    population: import.meta.glob(`/src/assets/data/population/*.tsv`, {as: 'raw'}),
    religion: import.meta.glob(`/src/assets/data/religion/*.tsv`, {as: 'raw'}),
    'social-condition': import.meta.glob(`/src/assets/data/social-condition/*.tsv`, {as: 'raw'}),
    GDP: import.meta.glob(`/src/assets/data/GDP/*.tsv`, {as: 'raw'}),
};

// create a set of missed regions
async function load() {
    const data = {};
    const years = {};
    const regionData = {};
    keywords.forEach(kw => {
        years[kw] = new Set();
        subKeywords[kw] = new Set();
    });
    const missedRegions = new Set(); // Only for debugging
    async function loadData(kw) {
        const modules = modulesMap[kw];
        for (const path in modules) {
            const content = await modules[path]();
            const parsedTsv = d3.tsvParse(content);
            parsedTsv.forEach((row) => {
                if (kw === "GDP") {
                    subKeywords[kw].add("GDP");
                    const {Canton, ...values} = row;
                    const yearKeys = Object.keys(values);
                    yearKeys.forEach((year) => {
                        years[kw].add(year);
                        const value = values[year];
                        if (!name2Region[Canton]) {
                            missedRegions.add(Canton);
                        } else {
                            const id = name2Region[Canton].id;
                            if (!data[kw]) data[kw] = {};
                            if (!data[kw][year]) data[kw][year] = {};
                            if (!data[kw][year][id]) data[kw][year][id] = {};
                            data[kw][year][id]['GDP'] = value;
                            if (!regionData[id]) regionData[id] = {};
                            if (!regionData[id][year]) regionData[id][year] = {};
                            if (!regionData[id][year][kw]) regionData[id][year][kw] = {};
                            regionData[id][year][kw]['GDP'] = value;
                        }
                    });
                } else {
                    const {title, year, value, canton, file_year} = row;
                    subKeywords[kw].add(title);
                    years[kw].add(year);
                    if (!name2Region[canton]) {
                        missedRegions.add(canton);
                    } else {
                        const id = name2Region[canton].id;
                        if (!data[kw]) data[kw] = {};
                        if (!data[kw][year]) data[kw][year] = {};
                        if (!data[kw][year][id]) data[kw][year][id] = {};
                        data[kw][year][id][title] = value;
                        if (!regionData[id]) regionData[id] = {};
                        if (!regionData[id][year]) regionData[id][year] = {};
                        if (!regionData[id][year][kw]) regionData[id][year][kw] = {};
                        regionData[id][year][kw][title] = value;
                    }
                }
            });
        }
    }

    for (const kw of keywords) {
        await loadData(kw);
    }
    const sortedYears = {};
    for (const kw of keywords) {
        sortedYears[kw] = Array.from(years[kw]).sort((a, b) => {
            if (a > b) return -1;
            if (a < b) return 1;
            return 0;
        });
    }

    return {data, regionData, sortedYears};
}


const store = createStore({
    state: () => ({
        data: {},
        regionData: {},
        years: {},
        keywords: [],
        subKeywords: {},
        regionStack: [],
        comparing: false,
        activeKeyword: null,
        activeYear: null,
        id2Region: id2Region,
    }),
    mutations: {
        setData(state, payload) {
            state.data = payload
        },
        setRegionData(state, payload) {
            state.regionData = payload
        },
        setYears(state, payload) {
            state.years = payload
        },
        setKeywords(state, payload) {
            state.keywords = payload;
        },
        setSubKeywords(state, payload) {
            state.subKeywords = payload;
        },
        resetStack(state) {
            state.regionStack = []
        },
        pushRegion(state, region) {
            state.regionStack.push(region)
            if (state.regionStack.length > 2) state.regionStack.shift()
        },
        setRouter(state, router) {
            state.router = router
        }
    },
    actions: {
        async initData({commit}) {
            const {data, regionData, sortedYears} = await load();
            commit('setData', data);
            commit('setRegionData', regionData);
            commit('setYears', sortedYears);
            commit('setKeywords', keywords);
            commit('setSubKeywords', subKeywords);
        }
    }
})

export default store;