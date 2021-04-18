<template>
    <div id="forms" class="w-75 p-3 mb-1 text-light">
        <fieldset>
            <input
                type="text"
                placeholder="Wallet Address"
                v-model="waddress"
                class="form-control"
                id="addr"
            />
        </fieldset>
        <input
            class="btn btn-block btn-success"
            type="button"
            value="Query"
            @click="$emit('eventUpd', waddress)"
            id="submitAddr"
        />
    </div>
</template>

<script>
export default {
    name: "WalletAddress",
    data() {
        return {
            waddress: "",
        };
    },
};
</script>
<style>
#forms {
    position: relative;
    margin-left: 12.5%;
}
#addr {
    margin-bottom: 15px;
    font-size: 1.2rem;
    background-color: black;
    color: greenyellow;
}
#submitAddr {
    font-size: 1.4rem;
    font-style: initial;
}
</style>
