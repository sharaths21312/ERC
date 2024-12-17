<script lang="ts">
	import '../app.css';
	import Header from './header.svelte';
	let { children } = $props();
</script>
<svelte:head>
	<title>Energy Recharge Calculator</title>
</svelte:head>
<Header/>
<main>
	{@render children()}
</main>
