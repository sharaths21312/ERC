<script lang="ts">
    import * as jsonfile from "$lib/characters.json"
	import type { TrawCharacterData } from "$lib/datatypes";
    import { metadata, charsSelected } from "$lib/index.svelte";
	import { setContext } from "svelte";
	import Character from "./character.svelte";
    
    const charsData = jsonfile.characters;
    console.log(charsData)
    setContext("jsonchars", charsData);
    let characterList: string[] = $state([]);
    for (const element of charsData) {
        for (const name of element.names) {
            characterList.push(name);
        }
    }
    characterList.sort()

    function getCharData(charName:string) {
        for (const elt of charsData) {
            if (elt.names.includes(charName)) {
                return elt as TrawCharacterData;
            }
        }
    }
    

    let char1 = "Shinobu"
    $charsSelected = {
        0: getCharData(char1) as TrawCharacterData,
        1: getCharData(char1) as TrawCharacterData,
        2: getCharData(char1) as TrawCharacterData,
        3: getCharData(char1) as TrawCharacterData,
    };

</script>

<div class="vflow-container flex flex-col items-center px-8">
    <div class="topbar-container items-center grid gap-5 grid-cols-4
     bg-neutral-700 p-3 rounded-lg my-3">
        <label for="duration">Duration</label>
        <input type="number" class="data-inputs" bind:value={$metadata.duration}>
        <label for="hppartcfg">HP Threshold Config</label>
        <select name="hppartcfg" id="hppartcfg" class="data-inputs" bind:value={$metadata.thresholdEnergyMode}>
            <option value="default">Default</option>
            <option value="none">None</option>
            <option value="custom">Custom</option>
        </select>
        {#if $metadata.thresholdEnergyMode == "custom"}
            <label for="customhpparticles">Custom Threshold</label>
            <input class="data-inputs" type="text" id="customhpparticles" bind:value={$metadata.customEnergyValue}/>
        {/if}
        <label for="mode">Mode</label>
        <select class="data-inputs" id="mode" name="mode" bind:value={$metadata.rotationMode}>
            <option value="fixed">Fixed</option>
            <option value="flexible">Flexible</option>
        </select>
        {#if $metadata.rotationMode == "fixed"}
            <label for="rotationlength">Length</label>
            <input class="data-inputs" type="number" id="rotationlength" bind:value={$metadata.rotationLength}/>
        {/if}
        {#if $metadata.isElectroReso}
            <label for="electroresinterval">Electro Resonance</label>
            <input class="data-inputs" type="text" id="electroresinterval" bind:value={$metadata.eResoInterval}/>
        {/if}
    </div>
    <div class="flex flex-row ">
        <Character charIndex={0}/>
    </div>
    <div>
        
    </div>
</div>

<datalist id="listchars">
    {#each characterList as c}
        <option value={c}></option>
    {/each}
</datalist>

<style>
    .topbar-container {
        width: min(90%, 800px);
        padding: 20px;
    }
    @media (max-width: 788px) {
        .topbar-container {
            grid-template-columns: auto 1fr;
        }
    }
    @media (max-width: 500px) {
        .topbar-container {
            grid-template-columns: auto;
        }
        .topbar-container label {
            text-align: center;
        }
    }

    .topbar-container label {
        margin-left: 5px;
        margin-right: 10px;
    }
    
    .data-inputs {
        color: black;
        text-align: center;
        margin-right: 20px;
        min-width: 0px;
        padding-inline: 8px;
        padding-block: 5px;
        width: 100%;
    }

    select option {
        appearance: none;
        text-align: center;
        border-radius: 0px;
    }
</style>