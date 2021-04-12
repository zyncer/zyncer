<template>
  <form @submit="submit">
    <fieldset>
      <input type="text" placeholder="Wallet Address" v-model="waddress">
    </fieldset>
    <input class="button-primary" type="submit" value="Query">
  </form>
</template>

<script>
export default {
  name: "WalletAddress",
  data() {
    return {
      waddress: ""
    };
  }
};
</script>