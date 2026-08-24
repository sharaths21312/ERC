<script lang="ts">
	import "../app.css"
	import Header from './header.svelte';
	import { createCharacter, set_calculator_state, set_char_data_file, set_data_file, set_gear_data_file, set_reset_funcs, set_stored_data, single_output } from '$lib/index.svelte';
	import type { ICalculatorState, ICharacter, IDataSchema, IGear, IOutput, TStoredData } from '$lib/datatypes';
	import file_data_in from '$lib/data.json'
	let { children } = $props();

	const empty_save: TStoredData = {
		version: 1,
		custom_chars: [],
		custom_gear: [],
		saves: []
	}

	let saves: TStoredData | null = $state(JSON.parse(localStorage.getItem("data") ?? "{}"));
	let autosave = true;
	let reload_key = $state(0);
	
	if (!saves?.version) {
		saves = structuredClone(empty_save)
		localStorage.setItem("data", JSON.stringify(saves));
	}
	saves = saves as TStoredData
	(() => {set_stored_data(saves!)})();
	
	window.addEventListener('beforeunload', (e) => {
		if (autosave) {
			saves!.last_save = calculator_state;
		}
		localStorage.setItem("data", JSON.stringify(saves));
	})

	let file_data: IDataSchema = {
		characters: [
			...file_data_in.characters as unknown as ICharacter[],
			...saves.custom_chars
		],
		gear: [
			...file_data_in.gear as unknown as IGear[],
			...saves.custom_gear
		]
	}

	set_data_file(file_data);

	let char_data: Record<string, ICharacter> = {};
	file_data.characters.forEach(char => {
		char.names.forEach(name => {
			char_data[name] = char;
		})
	});
	set_char_data_file(char_data);
	
	let gear_data: Record<string, IGear> = {};
	file_data.gear.forEach(gear => {
		gear.names.forEach(name => {
			gear_data[name] = gear
		})
	})
	set_gear_data_file(gear_data);

	if (saves.last_save && !saves.last_save?.general) { // if corrupted data, reset
		reset_last()
	}
	let calculator_state: ICalculatorState = $state(saves.last_save ? saves.last_save : {
		0: createCharacter("Flins", char_data),
		1: createCharacter("Ineffa", char_data),
		2: createCharacter("Columbina", char_data),
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

	function reset_last() {
		console.log("resetting")
		autosave = false;
		delete saves?.last_save;
		window.location.reload();
	}

	function reset_all() {
		saves = structuredClone(empty_save)
		autosave = false;
		localStorage.setItem("data", JSON.stringify(saves));
		window.location.reload();
	}

	function load(idx: number) {
		if (saves?.saves[idx]) {
			Object.assign(calculator_state, structuredClone($state.snapshot(saves.saves[idx].state)))
			// calculator_state = structuredClone($state.snapshot(saves.saves[idx].state))
		}
		// window.location.reload();
		reload_key++;
	}

	function save(name: string, output: IOutput) {
		let last_ers = []
		for (const i in [0, 1, 2, 3]) {
			// @ts-expect-error
			last_ers.push(output[i]?.er_req ?? 1)
		}
		saves?.saves.push({
			name: name,
			last_er: last_ers,
			state: structuredClone($state.snapshot(calculator_state))
		})
		localStorage.setItem("data", JSON.stringify(saves));
	}

	set_reset_funcs({
		reset: reset_last,
		reset_all: reset_all,
		load: load,
		save: save
	})

	$inspect(saves)
	$inspect(calculator_state)
	$inspect(reload_key)
</script>


<svelte:head>
	<title>Energy Recharge Calculator</title>
</svelte:head>

<header>
	<Header/>
</header>

<main style="zoom: 95%;">
	{#key reload_key}
		{@render children()}
	{/key}
</main>
