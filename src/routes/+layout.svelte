<script lang="ts">
	import "../app.css"
	import Header from './header.svelte';
	import { createCharacter, set_calculator_state, set_char_data_file, set_data_file, set_gear_data_file, set_output_state } from '$lib/index.svelte';
	import type { ICalculatorState, ICharacter, IDataSchema, IGear, IOutputElt } from '$lib/datatypes';
	import file_data from '$lib/data.json'
	let { children } = $props();

	set_data_file(file_data as unknown as IDataSchema);

	let char_data: Record<string, ICharacter> = {};
	file_data.characters.forEach(char => {
		char.names.forEach(name => {
			char_data[name] = char as unknown as ICharacter;
		})
	});
	set_char_data_file(char_data);
	
	let gear_data: Record<string, IGear> = {};
	file_data.gear.forEach(gear => {
		gear.names.forEach(name => {
			gear_data[name] = gear as unknown as IGear
		})
	})
	set_gear_data_file(gear_data);
	let calculator_state: ICalculatorState = $state({
		0: createCharacter("Flins", char_data),
		1: createCharacter("Columbina", char_data),
		2: createCharacter("Ineffa", char_data),
		3: createCharacter("Sucrose", char_data),
		general: {
			rotation_type: 'fixed',
			rotation_length: 20,
			total_duration: 90,
			electro_resonance_interval: 5.5,
			energy_pessimism: 0,
			hp_threshold_energy: 'default',
			hp_threshold_energy_custom: 9
		}
	})
	set_calculator_state(calculator_state)


	
	const single_output: IOutputElt = {
		particle_in: [0, 0, 0, 0, 0],
		flat_gen: [0, 0, 0, 0, 0]
	}

	set_output_state({
		0: structuredClone(single_output),
		1: structuredClone(single_output),
		2: structuredClone(single_output),
		3: structuredClone(single_output)
	});
</script>


<svelte:head>
	<title>Energy Recharge Calculator</title>
</svelte:head>

<header>
	<Header/>
</header>

<main style="zoom: 95%;">
	{@render children()}
</main>
