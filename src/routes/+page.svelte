<script lang="ts">
    import * as jsonfile from "$lib/characters.json"
	import type { TcharsSelected, TtotalParticleGeneration, Tmetadata, TJSONCharsData, TrawCharacterData } from "$lib/datatypes";
    // import {  } from "$lib/index.svelte";
	import { setContext } from "svelte";
	import Character from "./character.svelte";
    
    const charsData = jsonfile.characters;
    
    let isRotFixed = true;

    let metadata: Tmetadata = $state({
        rotationLength: 20,
        thresholdEnergyMode: "default",
        customEnergyValue: 0,
        rotationFixed: true,
        isElectroReso: false,
        eResoInterval: 5.5,
        duration: 90
    })

    let char1 = "Ayaka"
    let char2 = "Kokomi"
    let char3 = "Kazuha"
    let char4 = "Shenhe"
    let charsSelected: TcharsSelected = $state({
        0: getCharData(char1) as TrawCharacterData,
        1: getCharData(char2) as TrawCharacterData,
        2: getCharData(char3) as TrawCharacterData,
        3: getCharData(char4) as TrawCharacterData,
    });
    


    let characterNameList: string[] = $state([]);
    for (const element of charsData) {
        for (const name of element.names) {
            characterNameList.push(name);
        }
    }
    characterNameList.sort()

    function getCharData(charName:string) {
        for (const elt of charsData) {
            if (elt.names.includes(charName)) {
                return elt as TrawCharacterData;
            }
        }
    }

    function rotModeChange(e: Event) {
        if (isRotFixed != metadata.rotationFixed) {
            isRotFixed = !isRotFixed
            for (const char in energyProd.characters) {
                const chardata = energyProd.characters[char];
                let tbb = chardata.timeBetweenBurst
                chardata.timeBetweenBurst =
                    isRotFixed
                    ? tbb / metadata.rotationLength
                    : tbb * metadata.rotationLength;
            }
        }
    }

    let energyProd: TtotalParticleGeneration = $state({
        generalParticles: {
            type: "None",
            amount: 9
        },
        characters: []
    });
    setContext("changeChar", (charName: string, charIndex: number) =>
        charsSelected[charIndex] = getCharData(charName) as TrawCharacterData)
    setContext("charslist", characterNameList);
    setContext("metadata", metadata)
    setContext("charsSelected", charsSelected);
    setContext("energyproduction", energyProd)
    setContext("jsonchars", charsData);
    setContext("chardatagetter", getCharData);

</script>

<div class="vflow-container flex flex-col items-center px-8">
    <div class="topbar-container items-center grid gap-5 grid-cols-4
     bg-neutral-700 p-3 rounded-lg my-3">
        <label for="duration">Duration</label>
        <input type="number" class="data-inputs" bind:value={metadata.duration}>
        <label for="hp_threshold_mode">HP Threshold Config</label>
        <select name="hp_threshold_mode" id="hp_threshold_mode" class="data-inputs" bind:value={metadata.thresholdEnergyMode}>
            <option value="default">Default</option>
            <option value="none">None</option>
            <option value="custom">Custom</option>
        </select>
        {#if metadata.thresholdEnergyMode == "custom"}
            <label for="custom_hp_drops">Custom Threshold</label>
            <input class="data-inputs" type="text" id="custom_hp_drops" bind:value={metadata.customEnergyValue}/>
        {/if}
        <label for="mode">Mode</label>
        <select class="data-inputs" id="mode" name="mode" bind:value={metadata.rotationFixed} onchange={rotModeChange}>
            <option value={true}>Fixed</option>
            <option value={false}>Flexible</option>
        </select>
        {#if metadata.rotationFixed}
            <label for="rotationlength">Length</label>
            <input class="data-inputs" type="number" id="rotationlength" bind:value={metadata.rotationLength}/>
        {/if}
        {#if metadata.isElectroReso}
            <label for="electroresinterval">Electro Resonance</label>
            <input class="data-inputs" type="text" id="electroresinterval" bind:value={metadata.eResoInterval}/>
        {/if}
    </div>
    <div class="flex flex-row ">
        <Character charIndex={0}/>
        <Character charIndex={1}/>
        <Character charIndex={2}/>
        <Character charIndex={3}/>
    </div>
    <div>
        
    </div>
</div>

<datalist id="listchars">
    {#each characterNameList as c}
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
        margin-right: 20px;
    }

    :global(.data-inputs) {
        color: black;
        text-align: center;
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
    :global(input) {
        color: black;
    }
    input {
        margin: 0px;
    }
</style>