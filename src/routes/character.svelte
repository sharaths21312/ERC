<script lang="ts">
	import { get_calculator_state, get_char_data, get_char_data_file, get_output_state } from "$lib/index.svelte";

  let { idx }: { idx: 0 | 1 | 2 | 3 } = $props()
  let calculator_state = get_calculator_state();
  let current_char = $derived(calculator_state[idx])!;
  let output = get_output_state();
  // svelte-ignore state_referenced_locally
    let selected_name = $state(current_char?.name ?? "")
  
  
  function nameChange(e: Event) {
    if (Object.keys(get_char_data_file()).includes(selected_name)) {
      current_char.name = selected_name
    }
  }


</script>

{#if current_char !== null}
  <div class="flex flex-col mx-2 my-1">
    <input list="character-list" class="data_inputs" bind:value={selected_name} onchange={nameChange}
      onclick={(e) => {(e.target as HTMLInputElement).select()}}>
    
    <hr class="my-1">

    <div class="inputs-section">
      <div class="flex justify-around">
        <span>Skill uses </span>
        <button>+</button>
      </div>
    </div>

  </div>
{/if}


<style>
  .inputs-section {
    padding-inline: 4pt;
    /* padding-block: 2pt; */
  }
</style>