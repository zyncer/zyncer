<template>
    <div id="app">
        <img alt="Vue logo" src="./assets/logo.png" width="250" height="250" />
        <portfolio />
    </div>
</template>

<script>
import Portfolio from "./components/Portfolio.vue";

export default {
    name: "App",
    components: {
        Portfolio,
    },
    created() {
        document.title = "Mirror Portfolio";
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #ffffff;
    background: #000;
    margin-top: 0px;
    margin-bottom: 0px;
}
html,
body {
    background: #000;
    font-size: 0.9rem;
}
</style>
