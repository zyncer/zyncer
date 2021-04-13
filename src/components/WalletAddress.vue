<template>
<div id="forms" class="w-75 p-3 mb-1 text-light lead">
    <fieldset>
      <input type="text" placeholder="Wallet Address" v-model="waddress">
    </fieldset>
    <input class="button-primary" type="button" value="Query" @click="$emit('eventUpd', waddress)">
</div>
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
<style>
#forms {
  position:relative;
  margin-left: 12.5%;
}
input {
  margin-bottom: 10px;
}
</style>
