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
name2Region["Lucerne"] = name2Region["Luzern"];
name2Region["Geneva"] = name2Region["Genève"];
name2Region["Graubünden"] = name2Region["Graubünden/Grigioni"];
name2Region["Valais"] = name2Region["Valais/Wallis"];
name2Region["Saint Gallen"] = name2Region["St. Gallen"];

const keywords = ["language", "population", "religion", "social-condition", "gdp"];

const data = {};
const modulesMap = {
    language: import.meta.glob(`/src/assets/data/language/*.tsv`, {as: 'raw'}),
    population: import.meta.glob(`/src/assets/data/population/*.tsv`, {as: 'raw'}),
    religion: import.meta.glob(`/src/assets/data/religion/*.tsv`, {as: 'raw'}),
    'social-condition': import.meta.glob(`/src/assets/data/social-condition/*.tsv`, {as: 'raw'}),
    gdp: import.meta.glob(`/src/assets/data/gdp/*.tsv`, {as: 'raw'}),
};

// create a set of missed regions
const missedRegions = new Set();

async function loadData(kw) {
    const modules = modulesMap[kw];
    console.log(modules);
    for (const path in modules) {
        const content = await modules[path]();
        const data = d3.tsvParse(content);
        data.forEach((row) => {
            if (kw === "gdp") {
                const {Canton, ...values} = row;
                const yearKeys = Object.keys(values);
                yearKeys.forEach((year) => {
                    const value = values[year];
                    if (!name2Region[Canton]) {
                        missedRegions.add(Canton);
                    } else {
                        const id = name2Region[Canton].id;
                        if (!data[id]) data[id] = {};
                        if (!data[id][year]) data[id][year] = {};
                        if (!data[id][year][kw]) data[id][year][kw] = {};
                        data[id][year][kw]['gdp'] = value;
                    }
                });
            } else {
                const {title, year, value, canton, file_year} = row;
                if (!name2Region[canton]) {
                    missedRegions.add(canton);
                } else {
                    const id = name2Region[canton].id;
                    if (!data[id]) data[id] = {};
                    if (!data[id][year]) data[id][year] = {};
                    if (!data[id][year][kw]) data[id][year][kw] = {};
                    data[id][year][kw][title] = value;
                }
            }
        });
    }
}

let loaded = 0;

for (const kw of keywords) {
    await loadData(kw);
}

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