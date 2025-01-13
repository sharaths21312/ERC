import type { favGen } from "./index.svelte"

export type TrawCharacterData = {
    names: string[],
    element: TElement,
    weapon: TWeapon,
    particlesources: TparticleSource[]
}

export type TparticleSource = {
    label: string,
    amount: number,
    element: TElement,
    cooldown: Number,
    duration?: Number,
    energytype: "Turret"|"Flat"|"Instant"
}

export type TcharacterParticleGeneration =
{
    sources: {
        amount: number,
        charName: string,
        index: number,
        isFunnel: boolean,
        funnelAmt: number,
        funnelChar: number
    }[],
    favs: favGen[],
    fieldTimeFraction: number,
    timeBetweenBurst: number,
    bonusFlatEnergy: number,
    enabled: boolean
}

export type Tfunnel = {
    isFunnel: boolean,
    funnelAmt: number,
    funnelChar: number
}

export type TtotalParticleGeneration = {
    generalParticles: {
        type: TElement,
        amount: number
    },
    characters: {
        [index: number]: TcharacterParticleGeneration
    }
}

export type Tmetadata = {
    rotationLength: number,
    thresholdEnergyMode: string,
    customEnergyValue: number,
    rotationFixed: boolean,
    isElectroReso: boolean,
    eResoInterval: number,
    duration: number
}

export type TcharsSelected = {
    [index: number]: TrawCharacterData,
}

export type TJSONCharsData = {
    names: string[],
    element: string,
    weapon: string,
    helptext: string,
    particlesources: {
        label: string,
        cooldown: number,
        energytype: string,
        amount: number,
        duration: number,
    }[];
}[]


export type TElement = "Pyro"|"Hydro"|"Dendro"|"Electro"|"Cryo"|"Anemo"|"None"
export type TWeapon = "Sword"|"Claymore"|"Catalyst"|"Bow"|"Polearm"