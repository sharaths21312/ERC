<script lang="ts">
    import type { TcharsSelected, Tfunnel, Tmetadata, TrawCharacterData, TtotalParticleGeneration, TfavGen } from "$lib/datatypes";
	import { particleTransferFrac, sum } from "$lib/index.svelte";
    let { charIndex: thisCharIndex, thisCharName = $bindable("") }: { charIndex: number, thisCharName: string } = $props();
	import { getContext, onMount } from "svelte";
	import { flip } from "svelte/animate";
    import { slide } from "svelte/transition";
    
    let charsSelected = getContext("charsSelected") as TcharsSelected
    let thisChar = $derived(charsSelected[thisCharIndex])
    let metadata = getContext("metadata") as Tmetadata
    let energyProd: TtotalParticleGeneration = getContext("energyproduction")

    let charList = getContext("charslist") as string[]
    let changeChar = getContext("changeChar") as (s: string, idx: number) => null
    let charNameInp: HTMLInputElement
    const numberformat = Intl.NumberFormat('en-US', { 'maximumFractionDigits': 0 })

    if (!energyProd.characters[thisCharIndex]) {
        energyProd.characters[thisCharIndex] = {
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
    $inspect(thisCharName)

    let debug = $derived.by(() => {
        let particleEnergyTotal: number[] = []
        let flatEnergyTotal: number[] = []
        let totalfieldtime = 0
        for (const elt of Object.values(energyProd.characters)) {
            totalfieldtime += elt.fieldTimeFraction
        }
        let thisCharProd = energyProd.characters[thisCharIndex]
        let timeBetweenBurst = (metadata.rotationFixed // The ||1 accounts for non burst scenarios
                                    ? (thisCharProd.timeBetweenBurst || 1) * metadata.rotationLength
                                    : thisCharProd.timeBetweenBurst)
        let fieldtimefrac = thisCharProd.fieldTimeFraction / totalfieldtime

        // Character energy
        for (const charProd of Object.entries(energyProd.characters)) {
            if (!charProd[1].enabled) break;
            let cind = parseInt(charProd[0]);
            let amt = 0;
            let amtflat = 0;
            let relativeRots = metadata.rotationFixed ? (thisCharProd.timeBetweenBurst || 1)
                              : thisCharProd.timeBetweenBurst / energyProd.characters[cind].timeBetweenBurst;
            for (const sourceInput of charProd[1].sources) {
                let sourceData = charsSelected[cind].particlesources[sourceInput.index]
                let sourceAmt = sourceData.amount
                if (metadata.energyRNG != 0) {
                    if (sourceData.energytype == "Instant") {
                        // Unless the energy rng is custom, the worst case is the floor of the generation
                        sourceAmt -= metadata.energyRNG * (sourceData.manual_rng == null
                                                            ? (sourceAmt - Math.floor(sourceAmt))
                                                            : sourceData.manual_rng)
                    } else if (sourceData.energytype == "Turret") {
                        // Unless the energy rng is custom, the worst case is half the generation
                        sourceAmt *= (1 - (sourceData.manual_rng ?? 0.5) * metadata.energyRNG)
                    }
                }
                let energyMult = particleTransferFrac(sourceData.element, thisChar.element)
                // sourceData is the raw data
                // sourceInput is the user input
                if (sourceData.energytype == "Instant") {
                    let particles = sourceInput.amount * sourceAmt * energyMult * relativeRots
                    if (sourceInput.isFunnel && sourceInput.funnelChar == thisCharIndex) {
                        // If funnelling to this character
                        amt += (0.6 + 0.4 * sourceInput.funnelAmt/100) * particles
                    } else if (cind == thisCharIndex) {
                        if (sourceInput.isFunnel) {
                            // If funnelling to someone else
                            amt += (0.6 + 0.4 * (100 - sourceInput.funnelAmt)/100) * particles
                        } else {
                            // Particles for self
                            amt += particles
                        }
                    } else {
                        // Off field particles
                        amt += 0.6 * particles
                    }
                } else if (sourceData.energytype == "Flat") {
                    amtflat += sourceAmt * sourceInput.amount * relativeRots
                } else if (sourceData.energytype == "Self" && cind == thisCharIndex) {
                    amtflat += sourceAmt * sourceInput.amount;
                } else if (sourceData.energytype == "Turret") {
                    let sourceData = charsSelected[cind].particlesources[sourceInput.index]
                    let totaltime = 20;
                    if (metadata.rotationFixed) {
                        totaltime = metadata.rotationLength
                    } else {
                        totaltime = charProd[1].timeBetweenBurst
                    }
                    let uptime = Math.min(1, sourceInput.amount * sourceData.duration!/totaltime)
                    let numseconds = uptime * timeBetweenBurst
                    let energyMult = particleTransferFrac(sourceData.element, thisChar.element)
                    amt += energyMult * numseconds * (0.6 + 0.4 * fieldtimefrac) * sourceAmt
                }
            }

            for (const sourceInput of charProd[1].favs) {
                let particles = sourceInput.amount * 6 * relativeRots
                if (sourceInput.isFunnel && sourceInput.funnelChar == thisCharIndex) {
                    // If funnelling to this character
                    amt += (0.6 + 0.4 * sourceInput.funnelAmt/100) * particles
                } else if (cind == thisCharIndex) {
                    if (sourceInput.isFunnel) {
                        // If funnelling to someone else
                        amt += (0.6 + 0.4 * (100 - sourceInput.funnelAmt)/100) * particles
                    } else {
                        // Particles for self
                        amt += particles
                    }
                } else {
                    // Off field particles
                    amt += 0.6 * particles
                }
            }
            particleEnergyTotal[cind] = amt;
            flatEnergyTotal[cind] = amtflat;
        }

        // Default energy
        switch (metadata.thresholdEnergyMode) {
            case "default":
                particleEnergyTotal.push(18 * (0.6 + 0.4 * fieldtimefrac) * timeBetweenBurst/metadata.duration)
                break;
            case "custom":
                break;
        }
        // Electro resonance
        if (metadata.isElectroReso && metadata.eResoInterval > 0) {
            particleEnergyTotal[particleEnergyTotal.length - 1]
                += timeBetweenBurst / metadata.eResoInterval
                    * (thisChar.element == "Electro" ? 3 : 1) * (0.6 + 0.4 * fieldtimefrac)
        }

        let erpercent = 0;
        if (thisCharProd.timeBetweenBurst == 0) {
            erpercent = Math.max(100, (0 - sum(flatEnergyTotal))/sum(particleEnergyTotal) * 100)
        } else {
            erpercent = Math.max(100, (thisChar.burstcost - sum(flatEnergyTotal) - thisCharProd.bonusFlatEnergy)/sum(particleEnergyTotal) * 100)
        }
        return {
            energy: particleEnergyTotal,
            flat: flatEnergyTotal,
            erneed: erpercent
        };
    })

    function addFav () {
        energyProd.characters[thisCharIndex].favs.push({
            amount: 1,
            isFunnel: false,
            funnelChar: 0,
            funnelAmt: 100
        });
    }

    $effect(() => {
        charNameInp.value = thisChar.names[0]
    })

    function charInpChange() {
        if (charList.findIndex(x => x == charNameInp.value) != -1) {
            changeChar(charNameInp.value, thisCharIndex)
        }
    }

    function addSource() {
        if (!energyProd.characters[thisCharIndex]) {
            energyProd.characters[thisCharIndex] = {
                sources: [],
                favs: [],
                fieldTimeFraction: 1,
                timeBetweenBurst: 1,
                bonusFlatEnergy: 0,
                enabled: true,
            };
        }
        energyProd.characters[thisCharIndex].sources.push({
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
    class="p-2" title="Character" bind:value={thisCharName}>
    <div class="bg-gray-900 p-2 mt-2 flex flex-col">
        <!-- Final ER requirement display -->
        <span class="text-center mt-2 mb-1">Energy needed:</span>
        <span class="text-lg font-bold text-center mb-2">{numberformat.format(debug.erneed)}%</span>

        <div class="flex flex-col bg-slate-800 p-2 rounded-md">
            <div class="flex flex-row sourceheader">
                <h2 class="flex-1">Skill uses</h2>
                <button class="mr-2" onclick={addSource} title="Add">+</button>
            </div>
            <!-- Normal particle sources -->
            {#each energyProd.characters[thisCharIndex]?.sources ?? [] as c, i (c)}
                <div animate:flip={{duration:100}} transition:slide={{duration:100}}
                    class="flex flex-col items-center py-2 border-b border-solid border-white">
                    <!-- Skill type picker -->
                    <div class="my-1 flex flex-row self-stretch">
                        <select name="char{thisCharIndex}sourcefor{i}" class="data-inputs w-full" bind:value={c.index}>
                            {#each thisChar.particlesources as p, j}
                                <option value={j}>{p.label}</option>
                            {/each}
                        </select>
                        <button class="text-center px-3" onclick={() => energyProd.characters[thisCharIndex].sources.splice(i, 1)} title="Remove">×</button>
                    </div>
                    <!-- Skill amount and funnel -->
                    <div class="flex flex-row my-1 self-stretch">
                        <input type="number" class="flex-1 my-1" bind:value={c.amount} placeholder="# usages" title="# usages" min="0">
                        <input type="checkbox" class="mx-2" bind:checked={c.isFunnel} title="Funnel this">
                    </div>
                    {@render funnel(c, `character${thisCharIndex}src${i}funnel`)}
                </div>
            {/each}
        </div>
        <div class="my-2 bg-slate-700 rounded-md p-2 flex flex-col">
            <!-- Favonius -->
            <div class="mb-1 pb-1 border-b-2 border-white border-solid flex flex-row text-center text-lg font-bold ">
                <h2 class="flex-1">Favonius</h2>
                <button class="mr-2" onclick={addFav} title="Add">+</button>
            </div>
            {#each energyProd.characters[thisCharIndex].favs as fav, i (fav)}
                <div class="flex flex-col border-b border-white border-solid favinput my-1 pb-2"
                transition:slide={{duration:100}} animate:flip={{duration:100}}>
                    <div class="flex flex-row self-stretch">
                        <input type="number" bind:value={fav.amount} title="Number of procs">
                        <input type="checkbox" class="mx-2" bind:checked={fav.isFunnel} title="Funnel this">
                        <button class="text-center px-1" onclick={() => energyProd.characters[thisCharIndex].favs.splice(i, 1)} title="Remove">×</button>
                    </div>
                    {@render funnel(fav, `character${thisCharIndex}fav${i}funnel`)}
                </div>
            {/each}
        </div>
        <!-- Fieldtime and rot length -->
        <input class="charbottominp" type="number" id="character{thisCharIndex}bonusenergy" name="character{thisCharIndex}bonusenergy"
            bind:value={energyProd.characters[thisCharIndex].bonusFlatEnergy} placeholder="Bonus flat energy" title="Bonus flat energy">
        <input class="charbottominp" type="number" id="character{thisCharIndex}fieldtime" name="character{thisCharIndex}fieldtime"
            bind:value={energyProd.characters[thisCharIndex].fieldTimeFraction} placeholder="Fractional field time" title="Fractional field time">
        <input class="charbottominp" type="number" id="character{thisCharIndex}tbb" name="character{thisCharIndex}tbb"
            bind:value={energyProd.characters[thisCharIndex].timeBetweenBurst} placeholder={metadata.rotationFixed ? "No. rots per burst" : "Time between bursts"}
            title={metadata.rotationFixed ? "No. rots per burst" : "Time between bursts"}>
    </div>
</div>


{#snippet funnel(f: Tfunnel, name: string)}
    {#if f.isFunnel}
    <div class="flex flex-col self-stretch border-solid border-b border-white">
        <select class="funnel-select" bind:value={f.funnelChar}
            transition:slide={{duration:100}} title="Funnel to">
            {#each Object.entries(charsSelected) as activeChars, cidx}
                {#if activeChars && cidx != thisCharIndex}
                    <option value={cidx}>{activeChars[1].names[0]}</option>
                {/if}
            {/each}
            <option value={-1}>Nobody</option>
        </select>
        <span class="flex flex-row items-center text-center w-full bg-white text-black px-3"
            transition:slide={{duration:100}}>
            <input type="number" class="w-full border-none"
                bind:value={f.funnelAmt} min="0" max="100"
                placeholder="% funnelled" title="% funnelled">
            %
        </span>
    </div>
    {/if}
{/snippet}

<style>
    input {
        text-align: center;
        min-width: 0px;
    }
    input[type=number] {
        min-width: 0px;
    }
    select {
        min-width: 0px;
    }
    .charbottominp {
        margin-block: 2px;
        margin-inline: 3px;
        border-radius: 0px;
        border-width: 0px;
    }
    .funnel-select {
        color: black;
        margin-block: 0.4rem;
        padding: 0.2rem;
    }
    .sourceheader {
        text-align: center;
        font-size: 1.125rem;
        line-height: 1.5rem;
        font-weight: bold;
        margin-bottom: 2px;
        padding-bottom: 4px;
        border-bottom: 2px solid white;
    }
    input {
        color: black;
    }
</style>