<script lang="ts">
    import type { TcharsSelected, Tfunnel, TJSONCharsData, Tmetadata, TrawCharacterData, TtotalParticleGeneration } from "$lib/datatypes";
	import { favGen } from "$lib/index.svelte";
    let { charIndex }: { charIndex: number } = $props();
	import { getContext, onMount } from "svelte";
	import { flip } from "svelte/animate";
    import { slide } from "svelte/transition";
    
    let charsSelected = getContext("charsSelected") as TcharsSelected
    let thisChar = $state(charsSelected[charIndex])
    let metadata = getContext("metadata") as Tmetadata

    let energyProd: TtotalParticleGeneration = getContext("energyproduction")
    let charList = getContext("charslist") as string[]
    let changeChar = getContext("changeChar") as (s: string, idx: number) => null
    let jsondata = getContext("jsonchars") as TJSONCharsData
    let charNameInp: HTMLInputElement

    if (!energyProd.characters[charIndex]) {
        energyProd.characters[charIndex] = {
            // svelte-ignore state_referenced_locally
            sources: [{
                amount: 1,
                charName: thisChar.names[0],
                funnelAmt: 100,
                funnelChar: 0,
                isFunnel: false,
                index: 0
            }],
            favs: [],
            timeBetweenBurst: 1,
            fieldTimeFraction: 1,
            bonusFlatEnergy: 0,
            enabled: true
        };
    }

    function addFav () {
        energyProd.characters[charIndex].favs.push(new favGen());
    }

    $effect(() => {
        charNameInp.value = thisChar.names[0]
    })

    function charInpChange(e: Event) {
        e.preventDefault();
        if (charList.findIndex(x => x == charNameInp.value) != -1) {
            changeChar(charNameInp.value, charIndex)
            thisChar = charsSelected[charIndex]
        }
    }

    function changeEnergy() {
        if (!energyProd.characters[charIndex]) {
            energyProd.characters[charIndex] = {
                sources: [],
                favs: [],
                fieldTimeFraction: 1,
                timeBetweenBurst: 1,
                bonusFlatEnergy: 0,
                enabled: true,
            };
        }
        energyProd.characters[charIndex].sources.push({
            charName: thisChar.names[0],
            index: 0,
            amount: 1,
            funnelChar: 0,
            funnelAmt: 100,
            isFunnel: false
        })
    }

    function selectTextInput(e: MouseEvent) {
        let elt = e.target as HTMLInputElement
        elt.select();
    }

</script>
<div class="flex-col flex m-2">
    <input list="listchars" style="color: black;" onclick={selectTextInput}
    onchange={charInpChange} bind:this={charNameInp}
    class="p-2">
    <div class="bg-gray-900 p-2 mt-2 flex flex-col">
        <div class="flex flex-col bg-slate-800 p-2 rounded-md">
            <h2 class="sourceheader">Skill uses</h2>
            <!-- Normal particle sources -->
            {#each energyProd.characters[charIndex]?.sources ?? [] as c, i (c)}
                <div animate:flip={{duration:100}} transition:slide={{duration:100}}
                    class="flex flex-col items-center mt-1 mb-1 py-2 border-b border-solid border-white">
                    <!-- Skill type picker -->
                    <div class="my-2 flex flex-row self-stretch">
                        <select name="char{charIndex}sourcefor{i}" class="data-inputs w-full" bind:value={c.index}>
                            {#each thisChar.particlesources as p, j}
                                <option value={j}>{p.label}</option>
                            {/each}
                        </select>
                        <button class="text-center px-3" onclick={() => energyProd.characters[charIndex].sources.splice(i, 1)}>×</button>
                    </div>
                    <!-- Skill amount and funnel -->
                    <input type="number" class="w-full m-1" bind:value={c.amount} placeholder="# usages" min="0">
                    {@render funnel(c, `character${charIndex}src${i}funnel`)}
                </div>
            {/each}
            <button onclick={changeEnergy}>Add source</button>
        </div>
        <div class="my-2 bg-slate-700 rounded-md p-2 flex flex-col">
            <!-- Favonius -->
            <h2 class="text-center text-lg font-bold mb-1 pb-1 border-b-2 border-white border-solid">Favonius</h2>
            {#each energyProd.characters[charIndex].favs as fav, i (fav)}
                <div class="flex flex-col border-b border-white border-solid favinput my-1 pb-2"
                transition:slide={{duration:100}} animate:flip={{duration:100}}>
                    <div class="flex flex-row self-stretch">
                        <input type="number" bind:value={fav.amount}>
                        <button class="text-center px-3" onclick={() => energyProd.characters[charIndex].favs.splice(i, 1)}>×</button>
                    </div>
                    {@render funnel(fav, `character${charIndex}fav${i}funnel`)}
                </div>
            {/each}
            <button onclick={addFav}>Add Fav</button>
        </div>
        <!-- Fieldtime and rot length -->
        <input class="charbottominp" type="number" id="character{charIndex}bonusenergy" name="character{charIndex}bonusenergy"
        bind:value={energyProd.characters[charIndex].bonusFlatEnergy} placeholder="Bonus flat energy">
        <input class="charbottominp" type="number" id="character{charIndex}tbb" name="character{charIndex}tbb"
        bind:value={energyProd.characters[charIndex].timeBetweenBurst} placeholder={metadata.rotationFixed ? "No. rots per burst" : "Time between bursts"}>
        <input class="charbottominp" type="number" id="character{charIndex}fieldtime" name="character{charIndex}fieldtime"
        bind:value={energyProd.characters[charIndex].fieldTimeFraction} placeholder="Fractional field time">
        <!-- Final ER requirement display -->
        <span class="text-center mt-2 mb-1">Energy needed:</span>
        <span class="text-lg font-bold text-center mb-2">100%</span>
    </div>
</div>

{#snippet funnel(f: Tfunnel, name: string)}
<label for={name} class="my-1">
    <input type="checkbox" bind:checked={f.isFunnel} id={name}>
    Enable funnelling
</label>
    {#if f.isFunnel}
    <div class="flex flex-col self-stretch border-solid border-b border-white">
        <select class="text-black w-full p-1 my-2" bind:value={f.funnelChar} transition:slide={{duration:100}}>
            {#each Object.entries(charsSelected) as activeChars, cidx}
                {#if activeChars}
                    <option value={cidx}>{activeChars[1].names[0]}</option>
                {/if}
            {/each}
        </select>
        <span class="flex flex-row items-center text-center w-full bg-white text-black px-3" transition:slide={{duration:100}}>
            <input type="number" class="w-full px-2 m-1 mb-3 border-none"
                bind:value={f.funnelAmt} min="0" max="100"
                placeholder="% funnelled">
            %
        </span>
    </div>
    {/if}
{/snippet}

<style>
    input {
        margin: 2px;
        text-align: center;
        min-width: 0px;
    }
    select {
        min-width: 0px;
    }
    .charbottominp {
        margin-block: 3px;
        margin-inline: 4px;
        border-radius: 0px;
        border-width: 0px;
    }

    .sourceheader {
        text-align: center;
        font-size: 1.125rem;
        line-height: 1.75rem;
        font-weight: bold;
        margin-bottom: 5px;
        padding-bottom: 2px;
        border-bottom: 2px solid white;
    }
</style>