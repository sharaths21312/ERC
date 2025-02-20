<script lang="ts">
    import * as jsonfile from "$lib/characters.json"
	import type { TcharsSelected, TtotalParticleGeneration, Tmetadata, TrawCharacterData, TcharsStorage } from "$lib/datatypes";
	import { setContext } from "svelte";
	import Character from "./character.svelte";
	import { flip } from "svelte/animate";
	import { slide } from "svelte/transition";
    
    const charsData = jsonfile.characters;
    const energyProd: TtotalParticleGeneration = $state({
        generalParticles: {
            type: "None",
            amount: 9
        },
        characters: []
    })

    let storageData: TcharsStorage[] = $state([])
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
    // svelte-ignore non_reactive_update
        let loadModal: HTMLDialogElement;
    // This runs on page load
    $effect(() => {
        if (localStorage.getItem("data")) {
            storageData = JSON.parse(localStorage.getItem("data")!).data
        }
    })
    let charsSelected: TcharsSelected = $state([
        getCharData("Ayaka")!, getCharData("Kokomi")!,
        getCharData("Kazuha")!, getCharData("Shenhe")!]
    );

    $effect(() => {
        metadata.isElectroReso = Object.values(charsSelected).filter(x => x.element == "Electro").length >= 2
    })


    let characterNameList: string[] = $state([]);
    for (const element of charsData) {
        for (const name of element.names) {
            characterNameList.push(name);
        }
    }
    characterNameList.sort()
    var selectedCharNames: string[] = $state(
        charsSelected.map(element => {
            return element.names[0]
        }
    ))

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

    function exportJSON(): string {
        return JSON.stringify({
            energyProd: $state.snapshot(energyProd),
            names: Object.values(charsSelected).map(x => x.names[0])
        });
    }

    function loadObj(data: TcharsStorage) {
        debugger;
        for (let i = 0; i < data.names.length; i++) {
            charsSelected[i] = getCharData(data.names[i])!
            selectedCharNames[i] = charsSelected[i].names[0];
            energyProd.characters = data.data.characters
            energyProd.generalParticles = data.data.generalParticles
        }
    }
    function saveStorage() {
        localStorage.setItem("data", JSON.stringify({data: $state.snapshot(storageData)}))
    }
    function saveButtonClicked(event: MouseEvent) {
        debugger;
        let btn = event.target as HTMLButtonElement
        storageData.push({
            data: $state.snapshot(energyProd),
            names: Object.values($state.snapshot(charsSelected)).map(x => x.names[0])
        })
        saveStorage()
        btn.classList.add("greenindicator")
        btn.disabled = true
        setTimeout(() => {
            btn.classList.remove("greenindicator")
            btn.disabled = false
        }, 2000);
    }

    setContext("changeChar", (charName: string, charIndex: number) =>
        charsSelected[charIndex] = getCharData(charName) as TrawCharacterData)
    setContext("charslist", characterNameList);
    setContext("energyproduction", energyProd)
    setContext("selectedCharNames", selectedCharNames)
    setContext("metadata", metadata)
    setContext("charsSelected", charsSelected);
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
            <input class="data-inputs" type="text" title="Set 0 to disable"
            id="electroresinterval" bind:value={metadata.eResoInterval}/>
        {/if}
    </div>
    <div class="flex flex-row max-w-screen-2xl justify-center flex-wrap">
        <Character charIndex={0} bind:thisCharName={selectedCharNames[0]}/>
        <Character charIndex={1} bind:thisCharName={selectedCharNames[1]}/>
        <Character charIndex={2} bind:thisCharName={selectedCharNames[2]}/>
        <Character charIndex={3} bind:thisCharName={selectedCharNames[3]}/>
    </div>
    <div class="mt-3">
        {#each Object.values(charsSelected) as c}
            <p>{c.helptext}</p>
        {/each}
    </div>
    <div class="flex flex-row my-3">
        <button class="saveloadbtn" onclick={saveButtonClicked}>Save config</button>
        <button class="saveloadbtn" onclick={() => loadModal.showModal()}>Load config</button>

        <button class="saveloadbtn" disabled>Export JSON</button>
        <button class="saveloadbtn" disabled>Import JSON</button>
    </div>

    <dialog id="loadmodal" bind:this={loadModal} class="loadmodal">
        <div class="p-1 flex flex-row items-center">
            <span class="text-lg flex-1">Choose save</span>
            <button class="p-2 m-auto" onclick={() => loadModal.close()}>
                x
            </button>
        </div>
        {#each storageData as saved, i (saved)}
            <div class="flex flex-row border-solid rounded border-white border-2" animate:flip={{duration:100}} transition:slide={{duration:100}}>
                <div class="savednamesgrid grid content-center flex-1">
                    {#each saved.names as name}
                        <span class="m-1">{name}</span>
                    {/each}
                </div>
                <button class="p-1 m-1 rounded border-black border-solid border-2" onclick={() => {loadObj(saved)}}>load</button>
                <button class="p-1 m-1" onclick={() => {storageData.splice(i, 1); saveStorage()}}>x</button>
            </div>
        {/each}
    </dialog>
</div>

<datalist id="listchars">
    {#each characterNameList as c}
        <option value={c}></option>
    {/each}
</datalist>

<style>
    .loadmodal {
        min-width: 200px;
        min-height: 300px;
        opacity: 1;
        border-radius: 15px;
        color: white;
        padding: 20px;
        flex-direction: column;
        @apply bg-slate-700;
    }
    .loadmodal:open {
        display: flex;
    }
    .topbar-container {
        width: min(90%, 800px);
        padding: 20px;
    }
    .saveloadbtn {
        padding: 5px;
        margin: 3px;
        border: 2px solid white;
        border-radius: 10%;
    }
    .saveloadbtn:not(:disabled):hover {
        background-color: rgba(240, 248, 255, 0.174);
    }
    
    .savednamesgrid {
        display: grid;
        grid-template-columns: auto auto auto auto;
        padding: 10px;
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
        .savednamesgrid {
            grid-template-columns: auto auto;
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
    :global(.greenindicator) {
        background-color: rgba(17, 175, 17, 0.6);
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