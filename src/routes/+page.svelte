<script lang="ts">
  import Character from "./character.svelte";
  import { distinct, get_calculator_state, get_char_data_file, get_gear_data_file, getDataGenerator, getGearDataGenerator, remap_refine } from "$lib/index.svelte";
  import type { ICharacterConfig } from "$lib/datatypes";

  let calculator_state = get_calculator_state()
  let electro_reso = $state(true)
  let num_chars = $derived(([0,1,2,3] as const).reduce((prev: number, i) => prev + (calculator_state[i] != null ? 1 : 0), 0))
  // ugly hack but just checks each character
  const data = get_char_data_file();
  const getData = getDataGenerator(data);
  const gear_data = get_gear_data_file();
  const getGearData = getGearDataGenerator(gear_data);

  let allselections = $derived.by(() => {
    let chars = Object.values(calculator_state).map((elt: ICharacterConfig) => elt.name)
    let weps = distinct(Object.values(calculator_state).flatMap((elt: ICharacterConfig) => elt?.gear))
    console.log(chars, weps)
    return {
    characters: chars.filter(x => x),
    weapons: weps.filter(x => x)
  }})
  

  $inspect(calculator_state)
  $inspect(allselections)
</script>

<div class="flex flex-col items-center">
  <!-- Basic settings -->

  <div class="top_container grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">

    <!-- Fixed/flexible rotation -->
    <label for="rotation-type-input" class="top-label">
      <span class="top-label-text">Rotation type</span>
      <select class="data-inputs top-input" id="rotation-type-input" bind:value={calculator_state.general.rotation_type}>
        <option value="fixed">Fixed</option>
        <option value="flexible">Flexible</option>
      </select>
    </label>

    <!-- Rotation length -->
    {#if calculator_state.general.rotation_type == "fixed"}
      <label class="top-label" for="rotation-length-input">
        <span class="top-label-text">Rotation length</span>
        <input type="number" step="any" class="data-inputs top-input"
          id="rotation-length-input" bind:value={calculator_state.general.rotation_length}>
      </label>
    {/if}

    <!-- Electro resonance -->
    {#if electro_reso}
      <label class="top-label" for="electro-reso-input">
        <span class="top-label-text">Electro resonance</span>
        <input type="number" step="any" class="data-inputs top-input"
          id="electro-reso-input" bind:value={calculator_state.general.electro_resonance_interval}>
      </label>
    {/if}

    <!-- Particle drop assumptions -->
    <label for="hp-particles-type" class="top-label">
      <span class="top-label-text">Particle drops</span>
      <select class="data-inputs top-input" id="hp-particles-type" bind:value={calculator_state.general.hp_threshold_energy}>
        <option value="default">Default</option>
        <option value="none">None</option>
        <option value="custom">Custom</option>
      </select>
    </label>

    {#if calculator_state.general.hp_threshold_energy == "custom"}
      <label class="top-label" for="custom-particles-input">
        <span class="top-label-text">Custom drops</span>
        <input type="number" step="any" class="data-inputs top-input"
          id="custom-particles-input" bind:value={calculator_state.general.hp_threshold_energy_custom}>
      </label>
    {/if}

    <!-- Total duration -->
    <label class="top-label" for="total-duration">
      <span class="top-label-text">Duration</span>
      <input type="number" step="any" class="data-inputs top-input"
        id="total-duration" bind:value={calculator_state.general.total_duration}>
    </label>

    <!-- Particle generation -->
    <label for="particle-rng" class="top-label">
      <span class="top-label-text">Energy RNG</span>
      <select class="data-inputs top-input" id="particle-rng" bind:value={calculator_state.general.energy_pessimism}>
        <option value={0}>Average</option>
        <option value={0.5}>Safe</option>
        <option value={1}>Worst-case</option>
      </select>
    </label>
  </div>

  <div class="chars_container grid-cols-2 lg:grid-cols-4">
    <Character idx={0} />
    <Character idx={1} />
    <Character idx={2} />
    <Character idx={3} />
  </div>

  <ul>
    {#each allselections.characters as chars}
      {#if getData(chars)?.help}
        <li>{chars}: {getData(chars).help ?? ""}</li>
      {/if}
    {/each}

    {#each allselections.weapons as gear}
      {#if getGearData(gear)?.help}
        <li>{gear.name}: {getGearData(gear)?.help ?? ""}</li>
      {/if}
    {/each}
  </ul>
</div>


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

<div popover id="rots-per-burst">Number of rotations between bursts</div>
<div popover id="seconds-per-burst">Number of seconds between bursts</div>
<div popover id="bonus-flat-gen">Bonus flat energy generation</div>
<div popover id="fieldtime-popover">Field time (weight)</div>

<style>
  .top_container {
      max-width: 1500px;
      margin-block: 20px;
      padding: 8px;
      background-color: var(--panel-bg-col);
      border-radius: 10px;
      margin-inline: 40px;
      display: grid;
      justify-items: center;
      border: white 1px solid
  }

  .chars_container {
      margin-block: 20px;
      padding: 8px;
      background-color: var(--panel-bg-col);
      border-radius: 10px;
      margin-inline: 40px;
      display: grid;
      gap: 20px;
      justify-items: center;
      max-width: 1700px;
  }

  [popover] {
    position: relative;
    position-area: top span-right;
    background: var(--subpanel-bg-col);
    border-width: 1px;
    border-color: var(--selected-col);
    color: inherit;
    padding-inline: 5px;
    padding-block: 2px;
    border-radius: 4px;
  }

</style>