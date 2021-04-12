<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <wallet-address/>
    <portfolio/>
  </div>
</template>

<script>
import Portfolio from './components/Portfolio.vue';
import WalletAdress from './components/WalletAddress.vue';

export default {
  name: 'App',
  components: {
    Portfolio,
    'wallet-address': WalletAdress
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
