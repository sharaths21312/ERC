import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TcharsSelected, Tmetadata, TrawCharacterData, TtotalParticleGeneration } from "./datatypes";

export const metadata: Writable<Tmetadata> = $state(writable({
    rotationLength: 0,
    thresholdEnergyMode: "default",
    customEnergyValue: 0,
    rotationMode: "fixed",
    isElectroReso: false,
    eResoInterval: 5.5,
    duration: 90
}));

export const energyProd: Writable<TtotalParticleGeneration> = $state(writable({
    generalParticles: {
        type: "None",
        amount: 9
    },
    characters: []
}));

export const charsSelected: Writable<TcharsSelected> = $state(writable({}));