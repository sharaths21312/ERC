<script lang="ts">
    import type { TcharsSelected, TJSONCharsData, TrawCharacterData, TtotalParticleGeneration } from "$lib/datatypes";
    let { charIndex }: { charIndex: number } = $props();
    import { charsSelected, energyProd, metadata } from "$lib/index.svelte"
	import { getContext } from "svelte";

    let thisChar = $derived($charsSelected[charIndex])
    let energy: TtotalParticleGeneration = $derived($energyProd);
    let charList = getContext("charslist") as string[]
    let jsondata = getContext("jsonchars") as TJSONCharsData
    console.log(jsondata)

    function changeEnergy() {
        if (!energy.characters[0]) {
            energy.characters[0] = [];
        }
        energy.characters[0].push({
            amount: 1,
            funnelChar: [],
            generationType: "Instant",
            isFunnel: false,
            funnelTo: [],
            type: "Anemo"
        })
    }
</script>
<input list="listchars" style="color: black;">

<button onclick={changeEnergy}>energy</button>
