<script lang="ts">
	import '../app.css';
	import Header from './header.svelte';
	import { set_char_data_file, set_data_file, set_gear_data_file } from '$lib/index.svelte';
	import type { ICharacter, IDataSchema, IGear } from '$lib/datatypes';
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

</script>


<svelte:head>
	<title>Energy Recharge Calculator</title>
</svelte:head>

<header>
	<Header/>
</header>

<main>
	{@render children()}
</main>
