<script lang="ts">
    import { get_char_data, get_char_data_file, get_gear_data, get_gear_data_file, remap_refine } from "$lib/index.svelte";
    let gear_name = $state("Favonius")
    let gear_data = $derived(get_gear_data(gear_name))
    let generation_r5 = $derived.by(() => {
        let dat = get_gear_data(gear_name)
        return dat.refine_scaling ? remap_refine(dat.gen[0].amount, dat.refine_scaling, 5) : dat.gen[0].amount
    })
</script>

<input list="character-list">
<br>
<input list="gear-list" bind:value={gear_name}>
<p>
    Generation R1: {get_gear_data(gear_name).gen[0].amount} <br>
    Generation R5: {generation_r5}
</p>

<datalist id="character-list">
    {#each Object.keys(get_char_data_file()) as name}
        <option value={name}></option>
    {/each}
</datalist>

<datalist id="gear-list">
    {#each Object.keys(get_gear_data_file()) as name}
        <option value={name}></option>
    {/each}
</datalist>

<style>
    input {
        color: black;
    }
</style>