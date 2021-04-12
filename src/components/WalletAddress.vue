<template>
<div>
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
