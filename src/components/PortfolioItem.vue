<template>
  <div :key="asset.symbol">
    
    <!-- <h3>{{ asset.symbol }} {{ asset.name }} {{ asset.prices.price }}</h3> -->
  </div>
</template>

<script>
export default {
  name: "PortfolioItem",
  props: ["asset"]
};
</script>