<script lang="ts">
	import type { ICalculatorState, IGear, IGearSources, TCharIdx } from "$lib/datatypes";
	import { caseInsensitiveSearch, get_calculator_state, get_char_data_file, get_gear_data_file, get_output_state, getDataGenerator, getGearDataGenerator } from "$lib/index.svelte";

  const { idx }: { idx: TCharIdx } = $props()
  const calculator_state = get_calculator_state();
  const data = get_char_data_file();
  const gear_data = get_gear_data_file();
  // svelte-ignore state_referenced_locally
  const current_char = calculator_state[idx]!;
  const output = get_output_state();
  const current_req = $derived.by(() => {
    if (output()[idx]) {
      return Math.round(Math.max((output()[idx]!.er_req), 1) * 100)
    }
    return 100
  });
  let selected_name = $state(current_char?.name ?? "")

  const other_chars = [0, 1, 2, 3].filter(v => v !== idx) as unknown as TCharIdx[]
  const getData = getDataGenerator(data);
  const getGearData = getGearDataGenerator(gear_data);
  const refine_enabled = $derived(current_char.gear.map(gear => getGearData(gear).refine_scaling != undefined))

  function nameChange(e: Event) {
    if (Object.keys(data).includes(selected_name)) {
      current_char.name = selected_name
    }
  }

  function gearNameChange(elt: IGearSources) {
    let valid_name = caseInsensitiveSearch(elt.name, Object.keys(gear_data))
    if (valid_name) {
      elt.last_valid_name = valid_name
    }
  }

  function addSource(e: Event) {
    current_char.sources.push({
      source_idx: 0,
      num_uses: 1,
      funnel: {
        active: false,
        percentage: 100,
        to: other_chars[0]
      }
    })
  }


  function addGearSource(e: Event) {
    current_char.gear.push({
      amount: 1,
      name: "Favonius",
      last_valid_name: "Favonius",
      refine: 4,
      funnel: {
        active: false,
        to: other_chars[0],
        percentage: 100
      }
    })
  }
</script>

{#if current_char !== null}
  <div class="flex flex-col mx-2 my-1">
    <input list="character-list" class="data-inputs" bind:value={selected_name} onchange={nameChange}
      onclick={(e) => {(e.target as HTMLInputElement).select()}}>
    
    <h3 class="w-full text-center font-bold text-lg my-2">{current_req}%</h3>

    <div class="inputs-section">
      <div class="flex items-center justify-between px-3 py-0.5 my-1 mb-2 rounded-md subpanel-bg">
        <label for="add-skill-char-{idx}" class="select-none w-full hover:cursor-pointer">Skill uses</label>
        <button onclick={addSource} class="input-button" id="add-skill-char-{idx}">+</button>
      </div>

      {#each current_char.sources as source, i}
        <!-- Per-source input -->
        <div class="flex flex-col p-1 my-0.5 rounded-md" style="background-color: var(--highlight-col); border-width: 1px;">
          <div class="source-selector">
            <select class="data-inputs" bind:value={source.source_idx}>
              {#each getData(current_char.name).sources as source, source_idx}
                <option value={source_idx}>{source.title}</option>
              {/each}
            </select>
            <input class="data-inputs text-center p-0" bind:value={source.num_uses} title="Skill uses">
          </div>

          <!-- Source funnel -->
          <div class="funnel-selector">
            <label for="funnel-{idx}-source-{i}-box">
              Funnel?
            </label>
            <input type="checkbox" bind:checked={source.funnel.active}>
            <button class="subpanel-bg rounded-lg m-0.5" onclick={(_) => {current_char.sources.splice(i, 1)}}>&#x2715;</button>
          </div>

          {#if source.funnel.active}
            <div class="source-selector">
              <select class="data-inputs" bind:value={source.funnel.to}>
                {#each other_chars as charidx}
                  {#if calculator_state[charidx] != null}
                    <option value={charidx}>{calculator_state[charidx].name}</option>
                  {/if}
                {/each}
                <option value={-1}>Unknown</option>
              </select>
              <input class="data-inputs text-center" style="padding: 0;" bind:value={source.funnel.percentage}>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Equipment -->
    <div class="inputs-section">
      <div class="flex items-center justify-between px-3 py-0.5 my-1 rounded-md subpanel-bg">
        <label for="add-gear-char-{idx}" class="select-none w-full hover:cursor-pointer">Gear</label>
        <button onclick={addGearSource} class="input-button" id="add-gear-char-{idx}">+</button>
      </div>

      {#each current_char.gear as current_gear, i}
        <!-- Gear selection -->
        <div class="flex flex-col p-1 my-0.5 rounded-md" style="background-color: var(--highlight-col); border-width: 1px;">
          <div class="source-selector"
            style:grid-template-columns={refine_enabled[i] ? "110px 50px 40px" : "160px 40px"}>
            <input class="data-inputs" bind:value={current_gear.name}
              list="gear-list" onchange={() => gearNameChange(current_gear)}
              onclick={e => (e.target as HTMLInputElement).select()}>
            {#if refine_enabled[i]}
              <select class="data-inputs p-0 text-center" bind:value={current_gear.refine}>
                <option value={0}>R1</option>
                <option value={1}>R2</option>
                <option value={2}>R3</option>
                <option value={3}>R4</option>
                <option value={4}>R5</option>
              </select>
            {/if}
            <input class="data-inputs text-center p-0" bind:value={current_gear.amount} title="Number of triggers">
          </div>
          
          <!-- Gear funnel -->
          <div class="funnel-selector">
            <label for="funnel-{idx}-gear-{i}-box">
              Funnel?
            </label>
            <input type="checkbox" bind:checked={current_gear.funnel.active}>
            <button class="subpanel-bg rounded-lg m-0.5" onclick={(_) => {current_char.gear.splice(i, 1)}}>&#x2715;</button>
          </div>

          {#if current_gear.funnel.active}
            <div class="source-selector">
              <select class="data-inputs" bind:value={current_gear.funnel.to}>
                {#each other_chars as charidx}
                  {#if calculator_state[charidx] != null}
                    <option value={charidx}>{calculator_state[charidx].name}</option>
                  {/if}
                {/each}
                <option value={-1}>Unknown</option>
              </select>
              <input class="data-inputs text-center" style="padding: 0;" bind:value={current_gear.funnel.percentage}>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- General -->
    <div class="inputs-section">

      <!-- Extra flat gen -->
      <div class="bottom-input-container">
        <label for="char-{idx}-bonus-flat-gen"><button popovertarget="bonus-flat-gen">Bonus &#x1F6C8;</button></label>
        <input type="number" step="any" class="data-inputs numbers-bottom"
          id="char-{idx}-bonus-flat-gen" bind:value={current_char.extra_flat_gen}>
      </div>

      <!-- Fieldtime share -->
      <div class="bottom-input-container">
        <label for="char-{idx}-bonus-fieldtime"><button popovertarget="fieldtime-popover">Fieldtime &#x1F6C8;</button></label>
        <input type="number" step="any" class="data-inputs numbers-bottom"
          id="char-{idx}-bonus-fieldtime" bind:value={current_char.fieldtime}>
        </div>
        
      {#if getData(current_char.name).bursts.length > 1}
        <div class="bottom-input-container">
          <label for="char-{idx}-burst-id">Burst</label>
          <select id="char-{idx}-burst-id" class="data-inputs numbers-bottom" bind:value={current_char.bursts.source_idx}>
            {#each getData(current_char.name).bursts as burst, idx}
              <option value={idx}>{burst.name}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if calculator_state.general.rotation_type == "fixed"}
        <div class="bottom-input-container">
          <label for="char-{idx}-burst-rotcount"><button popovertarget="bursts-per-rot">B/R &#x1F6C8;</button></label>
          <input type="number" step="any" class="data-inputs numbers-bottom"
            id="char-{idx}-burst-rotcount" bind:value={current_char.bursts.rot_count}>
        </div>
      {:else}
        <div class="bottom-input-container">
          <label for="char-{idx}-burst-seccount"><button popovertarget="seconds-per-burst">S/B &#x1F6C8;</button></label>
          <input type="number" step="any" class="data-inputs numbers-bottom"
            id="char-{idx}-burst-seccount" bind:value={current_char.bursts.interval}>
        </div>
      {/if}

    </div>
  </div>
{/if}
<!-- 
{#snippet burst_interval(burst_idx: number)}
  {#if calculator_state.general.rotation_type == "fixed"}
    <div class="bottom-input-container">
      <label for="char-{idx}-burst-{burst_idx}-rotcount"><button popovertarget="rots-per-burst">R/B &#x1F6C8;</button></label>
      <input type="number" step="any" class="data-inputs numbers-bottom"
        id="char-{idx}-burst-{burst_idx}-rotcount" bind:value={current_char.bursts.rot_count}>
    </div>
  {:else}
    <div class="bottom-input-container">
      <label for="char-{idx}-burst-{burst_idx}-seccount"><button popovertarget="seconds-per-burst">S/B &#x1F6C8;</button></label>
      <input type="number" step="any" class="data-inputs numbers-bottom"
        id="char-{idx}-burst-{burst_idx}-seccount" bind:value={current_char.bursts.interval}>
    </div>
  {/if}
{/snippet} -->


<style>
  /* .inputs-section {
    padding-inline: 8pt;
    margin-block: 3pt;
  } */

  .source-selector {
    display: grid;
    grid-template-columns: 160px 40px;
  }

  .data-inputs {
    border-radius: 2px;
    min-width: 0;
    /* width: fit-content; */
    padding-block: 3px;
    padding-inline: 12px;
    overflow-x: scroll;
  }

  .funnel-selector {
    display: grid;
    grid-template-columns: 130px 35px 25px;
    padding-left: 12px;
    padding-right: 2px;
    padding-block: 3px;
    align-items: center;
  }

  .subpanel-bg {
    background-color: var(--subpanel-bg-col);
  }

  .numbers-bottom { 
    width: 120px;
  }
  
  .bottom-input-container { 
    margin-block: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-inline: 5px;
  }
</style>