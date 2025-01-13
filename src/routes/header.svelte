<script lang="ts">
	import { onMount } from "svelte";
    import "../app.css"


    let activeelt = false;
    onMount(() => {
        activeelt = document.location.pathname == "/help"
    })
</script>

<div class="flex w-full p-2 px-5 justify-between items-center bg-zinc-700">
    <h2 class="font-bold text-lg">Energy Recharge Calculator</h2>
    <div class="mx-3 {activeelt ? '.highlight' : ''}">
        <a href="/help">Help</a>
    </div>
</div>

<style>
</style>