<script lang="ts">
  import Character from "./character.svelte";
  import { distinct, eltmulti, funnelAndFieldtime, get_calculator_state, get_char_data_file, get_gear_data_file, get_output_state, get_reset_funcs, get_stored_data, getDataGenerator, getGearDataGenerator, getRNGGen, isParticle, remap_refine, set_output_state, single_output, sum } from "$lib/index.svelte";
  import type { ICalculatorState, ICharacterConfig, ICharacterSource, IOutput, IParticleGenEntry, TCharIdx } from "$lib/datatypes";

  let calculator_state = get_calculator_state()
  const indices = [0, 1, 2, 3] as const;
  const num_chars = $derived((indices.reduce((prev: number, i) => prev + (calculator_state[i] != null ? 1 : 0), 0)));
  const data = get_char_data_file();
  const getData = getDataGenerator(data);
  const gear_data = get_gear_data_file();
  const getGearData = getGearDataGenerator(gear_data);
  const saves = get_stored_data();
  const save_funcs = get_reset_funcs();
  let save_dialog: HTMLDialogElement;
  let load_dialog: HTMLDialogElement;
  let save_name = $state("");
  let reload_key = $state(0);
  console.log('loaded')

  let electro_reso = $derived.by(() => {
    let electro_count = 0;
    for (const cidx of indices) {
      if (!calculator_state[cidx]) {
        continue;
      }
      if (getData(calculator_state[cidx].name).element == "Electro") {
        electro_count++;
      }
    }
    return electro_count == 2 && num_chars == 4
  })
  const output = $derived(generate_output(calculator_state));
  set_output_state(() => output)
  
  let allselections = $derived({
      characters: Object.values(calculator_state).map((elt: ICharacterConfig) => elt.name).filter(x => x),
      weapons: distinct(Object.values(calculator_state).flatMap((elt: ICharacterConfig) => elt?.gear).filter(x => x))
  })
  
  function generate_output(calculator_state: ICalculatorState): IOutput {
    // the big one
    let output: IOutput = {
      0: structuredClone(single_output),
      1: structuredClone(single_output),
      2: structuredClone(single_output),
      3: structuredClone(single_output)
    };
    const isfixed = calculator_state.general.rotation_type == "fixed"
    
    for (const curr_cidx of indices) {
      const char = calculator_state[curr_cidx];
      if (!char) continue;
      const char_data = getData(char.name);
      const fieldtime_frac = char.fieldtime/(sum(indices.map(i => calculator_state[i]?.fieldtime)))

      for (const other_cidx of indices) {
        const source_char = calculator_state[other_cidx];
        if (!source_char) continue;
        const source_char_data = getData(source_char.name);

        for (const inp_source of source_char.sources) {
          const data_source = source_char_data.sources[inp_source.source_idx]
          for (const gen of data_source.gen) {
            // main logic
            let genpersec = 0;

            // insances of particle/turret generation/sec
            const skill_interval = isfixed ? calculator_state.general.rotation_length : source_char.bursts.interval
            if (gen.type.includes("turret")) {
              const recast_interval = skill_interval/inp_source.num_uses;
              const turret_time_frac = Math.min(1, gen.duration!/recast_interval)
              genpersec = turret_time_frac * getRNGGen(gen, calculator_state.general.energy_pessimism)
            } else {
              genpersec = inp_source.num_uses/skill_interval * getRNGGen(gen, calculator_state.general.energy_pessimism)
            }

            const funnel_frac = funnelAndFieldtime(inp_source, gen, curr_cidx, other_cidx, fieldtime_frac, num_chars)

            // energy generated = instances of particles/sec * funnel fraction * value of particle (for particle)
            if (gen.type.includes("flat")) {
              output[curr_cidx]!.flat_gen[other_cidx] += genpersec * funnel_frac
            } else {
              output[curr_cidx]!.particle_in[other_cidx] += genpersec * funnel_frac * eltmulti(char_data.element, source_char_data.element)
            }
          }
        }

        for (const inp_gear of source_char.gear) {
          const data_gear = getGearData(inp_gear)
          for (const gen of data_gear.gen) {
            // main logic
            let genpersec = 0;

            // insances of particle/turret generation/sec
            const skill_interval = isfixed ? calculator_state.general.rotation_length : source_char.bursts.interval
            if (gen.type.includes("turret")) {
              const recast_interval = skill_interval/inp_gear.amount;
              const turret_time_frac = gen.duration!/Math.min(recast_interval, gen.duration!)
              genpersec = turret_time_frac * remap_refine(gen.amount, data_gear.refine_scaling ?? 1, inp_gear.refine ?? 0)
            } else {
              genpersec = remap_refine(gen.amount, data_gear.refine_scaling ?? 1, inp_gear.refine ?? 0) * inp_gear.amount/skill_interval
            }

            const funnel_frac = funnelAndFieldtime(inp_gear, gen, curr_cidx, other_cidx, fieldtime_frac, num_chars)

            // energy generated = instances of particles/sec * funnel fraction * value of particle (for particle)
            if (gen.type.includes("flat")) {
              output[curr_cidx]!.flat_gen_gear[other_cidx] += genpersec * funnel_frac
            } else {
              output[curr_cidx]!.particle_in_gear[other_cidx] += genpersec * funnel_frac * eltmulti(char_data.element, "None")
            }
          }
        }
      }
      let fieldtime_mult = 0.6 + 0.4 * fieldtime_frac
      // basic gen
      switch (calculator_state.general.hp_threshold_energy) {
        case "default":
          output[curr_cidx]!.particle_in[5] += 2 * 9/calculator_state.general.total_duration * fieldtime_mult
          break
        case "none":
          break
        case "custom":
          output[curr_cidx]!.particle_in[5] += 2 * 9/calculator_state.general.total_duration * fieldtime_mult
          break
      }
      // electro resonance
      if (electro_reso) {
        let elt_mult = eltmulti(char_data.element, "Electro");
        let countpersec = 1/calculator_state.general.electro_resonance_interval
        output[curr_cidx]!.particle_in[4] += elt_mult * fieldtime_mult * countpersec
      }

      const energy_needed_persec = char_data.bursts[char.bursts.source_idx].energy / (isfixed ? calculator_state.general.rotation_length/char.bursts.rot_count : char.bursts.interval)

      // ER needed = (burst cost - flat gen)/particle gen
      output[curr_cidx]!.er_req = (energy_needed_persec - sum(output[curr_cidx]!.flat_gen) - sum(output[curr_cidx]!.flat_gen_gear))/
        (sum(output[curr_cidx]!.particle_in) + sum(output[curr_cidx]!.particle_in_gear))
    }

    return output;
  }

  function get_interval(cidx: TCharIdx) {
    if (calculator_state.general.rotation_type == "fixed") {
      return calculator_state.general.rotation_length
    } else {
      return calculator_state[cidx]!.bursts.interval
    }
  }
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
        <option value={1}>Average</option>
        <option value={0.5}>Safe</option>
        <option value={0}>Worst-case</option>
      </select>
    </label>
  </div>

  <div class="chars_container grid-cols-2 lg:grid-cols-4">
    <Character idx={0} />
    <Character idx={1} />
    <Character idx={2} />
    <Character idx={3} />
  </div>

  <!-- Save/load buttons -->
  <div>
    <button onclick={() => save_dialog.showModal()} class="px-2 py-1 m-3 panel_bg border-2 border-white">Save</button>
    <button onclick={() => load_dialog.showModal()} class="px-2 py-1 m-3 panel_bg border-2 border-white">Load</button>
    <button onclick={() => save_funcs.reset()} class="px-2 py-1 m-3 panel_bg border-2 border-white">Reset</button>
    <button onclick={() => save_funcs.reset_all()} class="px-2 py-1 m-3 panel_bg border-2 border-white">Reset all</button>
  </div>

  <ul class="max-w-screen-lg mx-8">
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

<h2 class="text-2xl text-center my-4">Particle gen</h2>
<div class="flex w-full justify-center gap-3">
  <table>
    <thead>
      <tr>
        <th></th>
        {#each indices as cidx}
          <th>{calculator_state[cidx]?.name}</th>
        {/each}
        <th>Others</th>
        <th>Drop</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
        {#each indices as cidx}
          <tr>
            <td>{calculator_state[cidx]?.name}</td>
            {#each [0, 1, 2, 3, 4, 5] as oidx}
              <td>{((output[cidx]?.particle_in[oidx] ?? 0) * get_interval(cidx)).toFixed(2)}</td>
            {/each}
            <td>{(sum(output[cidx]?.particle_in!) * get_interval(cidx)).toFixed(2)}</td>
          </tr>
        {/each}
    </tbody>
  </table>
</div>

<h2 class="text-2xl text-center my-4">Particle gen (gear)</h2>
<div class="flex w-full justify-center gap-3">
  <table>
    <thead>
      <tr>
        <th></th>
        {#each indices as cidx}
          <th>{calculator_state[cidx]?.name}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
        {#each indices as cidx}
          <tr>
            <td>{calculator_state[cidx]?.name}</td>
            {#each [0, 1, 2, 3] as oidx}
              <td>{((output[cidx]?.particle_in_gear[oidx] ?? 0) * get_interval(cidx)).toFixed(2)}</td>
            {/each}
          </tr>
        {/each}
    </tbody>
  </table>
</div>

<h2 class="text-2xl text-center my-4">Flat energy gen</h2>
<div class="flex w-full justify-center gap-3">
  <table>
    <thead>
      <tr>
        <th></th>
        {#each indices as cidx}
          <th>{calculator_state[cidx]?.name}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
        {#each indices as cidx}
          <tr>
            <td>{calculator_state[cidx]?.name}</td>
            {#each [0, 1, 2, 3] as oidx}
              <td>{((output[cidx]?.flat_gen[oidx] ?? 0) * get_interval(cidx)).toFixed(2)}</td>
            {/each}
          </tr>
        {/each}
    </tbody>
  </table>
</div>

<h2 class="text-2xl text-center my-4">Flat energy gen (gear)</h2>
<div class="flex w-full justify-center gap-3">
  <table>
    <thead>
      <tr>
        <th></th>
        {#each indices as cidx}
          <th>{calculator_state[cidx]?.name}</th>
        {/each}
      </tr>
    </thead>
    <tbody>
        {#each indices as cidx}
          <tr>
            <td>{calculator_state[cidx]?.name}</td>
            {#each [0, 1, 2, 3] as oidx}
              <td>{((output[cidx]?.flat_gen_gear[oidx] ?? 0) * get_interval(cidx)).toFixed(2)}</td>
            {/each}
          </tr>
        {/each}
    </tbody>
  </table>
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

<div popover id="bursts-per-rot">Number of bursts per rotation</div>
<div popover id="seconds-per-burst">Number of seconds between bursts</div>
<div popover id="bonus-flat-gen">Bonus flat energy generation</div>
<div popover id="fieldtime-popover">Field time (weight)</div>

<!-- Save modal -->

<dialog bind:this={save_dialog}>
  <div class="panel_bg">
    <form method="dialog" class="flex flex-col p-3" onsubmit={() => save_funcs.save(save_name, output)}>
      <div class="grid m-2" style="grid-template-columns: 1fr auto;">
        <div>Save state</div>
        <button onclick={() => save_dialog.close()}>X</button>
      </div>
      <div class="grid gap-2 m-2 items-center" style="grid-template-columns: auto 1fr;">
        <label for="save_name" class="mr-2">Name</label>
        <input name="save_name" bind:value={save_name} class="data-inputs">
      </div>
      <button type="submit" class="px-2 my-2 border-white border-2 self-center">Save</button>
    </form>
  </div>
</dialog>

<!-- Load modal -->
<dialog bind:this={load_dialog}>
  <div class="panel_bg flex-col flex">
    <div class="grid p-2 px-4 gap-2" style="grid-template-columns: 1fr auto;">
      <div>Load saved state</div>
      <button onclick={() => load_dialog.close()}>X</button>
    </div>
    {#each saves.saves as save, idx}
      <div class="grid mx-3 my-1 p-2" style="grid-template-columns: 1fr auto auto;">
        <div class="mx-2 p-1">{save.name}</div>
        <button onclick={() => { load_dialog.close(); save_funcs.load(idx); reload_key++; } } class="px-1 mx-1 border-white border-2">Load</button>
        <button onclick={() => { saves.saves.splice(idx, 1) }} class="px-1 mx-1 border-white border-2">Delete</button>
      </div>
    {/each}
  </div>
</dialog>

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

  .panel_bg {
    background-color: var(--panel-bg-col);
    color: white;
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

  th, td {
    padding: 3px;
    border: 1px solid white;
  }

  dialog {
    border: 2px solid white;
    border-radius: 4px;
  }
</style>