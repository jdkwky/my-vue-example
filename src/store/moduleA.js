const state = {
    name: 'moduleA'
}
const mutations = {
    setName(state, name){
        state.name = name;
    }
};
const actions = {};
const getters = {};

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}
