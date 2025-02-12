<script lang="ts">
	import { onMount } from "svelte";
    import { base } from "$app/paths";
    import { PUBLIC_HASH } from "$env/static/public";
    import "../app.css"

    let path = $state(`${base}/`)
    onMount(() => {
        path = document.location.pathname
        for (const link of document.getElementsByTagName("a")) {
            link.addEventListener("click", (e) => {
                var lnk = e.currentTarget as HTMLLinkElement
                path = lnk.href.split("/")[3]
            })
        }
    })

</script>

<div class="flex w-full px-5 justify-between items-center bg-zinc-700">
    <a class="font-bold text-lg" href="{base}/">Energy Recharge Calculator
        <span class="font-normal text-sm">Hash: {(PUBLIC_HASH ?? "unknown").slice(0, 7)}</span>
    </a>
    <div class="mx-3">
        <a href="{base}/data" class="{path == "data" ? "highlight" : ""}">Data</a>
        <a href="{base}/help" class="{path == "help" ? "highlight" : ""}">Help</a>
    </div>
</div>

<style>
    a {
        padding-inline: 15px;
        padding-block: 7px;
        margin-inline: 5px;
        margin-block: 5px;
        border-radius: 5px;
    }

    .highlight {
        background-color: rgb(48, 48, 62);
    }
</style>