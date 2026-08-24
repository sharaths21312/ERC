<script lang="ts">
    import { version } from "$app/environment";
	import { resolve } from "$app/paths";
    import { page } from "$app/state";
</script>

<div class="flex w-full px-5 justify-between items-center">
    <a class="font-bold text-lg" href="{resolve("/")}">Energy Recharge Calculator
        <span class="font-normal text-sm">{version}</span>
    </a>
    <div class="mx-3">
        <a href="{resolve("/data")}" class="{page.route.id == "/data" ? "highlight" : ""}">Data</a>
        <a href="{resolve("/help")}" class="{page.route.id == "/help" ? "highlight" : ""}">Help</a>
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
        background-color: var(--selected-col);
        color: black;
    }
</style>