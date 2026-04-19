<script lang="ts">
  import Character from "./character.svelte";
  import { get_calculator_state, get_char_data, get_char_data_file, get_gear_data, get_gear_data_file, remap_refine } from "$lib/index.svelte";

  let calculator_state = get_calculator_state()
  let electro_reso = $state(true)
  let num_chars = $derived(([0,1,2,3] as const).reduce((prev: number, i) => prev + (calculator_state[i] != null ? 1 : 0), 0))
  // ugly hack but just checks each character



</script>

<div class="flex flex-col items-center">
  <!-- Basic settings -->

  <div class="top_container grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">

    <!-- Fixed/flexible rotation -->
    <label for="rotation-type-input" class="top_label">
      <span class="top_label_text">Rotation type</span>
      <select class="data_inputs top_input" id="rotation-type-input" bind:value={calculator_state.general.rotation_type}>
        <option value="fixed">Fixed</option>
        <option value="flexible">Flexible</option>
      </select>
    </label>

    <!-- Rotation length -->
    {#if calculator_state.general.rotation_type == "fixed"}
      <label class="top_label" for="rotation-length-input">
        <span class="top_label_text">Rotation length</span>
        <input type="number" step="any" class="data_inputs top_input"
          id="rotation-length-input" bind:value={calculator_state.general.rotation_length}>
      </label>
    {/if}

    <!-- Electro resonance -->
    {#if electro_reso}
      <label class="top_label" for="electro-reso-input">
        <span class="top_label_text">Electro resonance</span>
        <input type="number" step="any" class="data_inputs top_input"
          id="electro-reso-input" bind:value={calculator_state.general.electro_resonance_interval}>
      </label>
    {/if}

    <!-- Particle drop assumptions -->
    <label for="hp-particles-type" class="top_label">
      <span class="top_label_text">Particle drops</span>
      <select class="data_inputs top_input" id="hp-particles-type" bind:value={calculator_state.general.hp_threshold_energy}>
        <option value="default">Flexible</option>
        <option value="none">Fixed</option>
        <option value="custom">Custom</option>
      </select>
    </label>

    {#if calculator_state.general.hp_threshold_energy == "custom"}
      <label class="top_label" for="custom-particles-input">
        <span class="top_label_text">Custom drops</span>
        <input type="number" step="any" class="data_inputs top_input"
          id="custom-particles-input" bind:value={calculator_state.general.hp_threshold_energy_custom}>
      </label>
    {/if}

    <!-- Total duration -->
    <label class="top_label" for="total-duration">
      <span class="top_label_text">Duration</span>
      <input type="number" step="any" class="data_inputs top_input"
        id="total-duration" bind:value={calculator_state.general.total_duration}>
    </label>

    <!-- Particle generation -->
    <label for="particle-rng" class="top_label">
      <span class="top_label_text">Energy RNG</span>
      <select class="data_inputs top_input" id="particle-rng" bind:value={calculator_state.general.energy_pessimism}>
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

<style>
  .top_container {
      max-width: 1500px;
      margin-block: 20px;
      padding: 8px;
      background-color: rgb(50, 50, 50);
      border-radius: 10px;
      margin-inline: 40px;
      display: grid;
      justify-items: center;
  }

  .chars_container {
      margin-block: 20px;
      padding: 8px;
      background-color: rgb(50, 50, 50);
      border-radius: 10px;
      margin-inline: 40px;
      display: grid;
      gap: 20px;
      justify-items: center;
      max-width: 1700px;
  }
</style>