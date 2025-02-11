import type { favGen } from "./index.svelte"

export type TrawCharacterData = {
    names: string[],
    element: TElement,
    weapon: TWeapon?,
    burstcost: number,
    cooldown: number?,
    particlesources: TparticleSource[],
    helptext: string?
}

export type TparticleSource = {
    label: string,
    amount: number,
    element: TElement,
    cooldown: number,
    duration?: number,
    energytype: "Turret"|"Flat"|"Instant"|"Self"
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
    thresholdEnergyMode: "default"|"none"|"custom",
    customEnergyValue: number,
    rotationFixed: boolean,
    isElectroReso: boolean,
    eResoInterval: number,
    duration: number
}

export type TcharsSelected = {
    [index: number]: TrawCharacterData,
}


export type TElement = "Pyro"|"Hydro"|"Dendro"|"Electro"|"Cryo"|"Anemo"|"Geo"|"None"
export type TWeapon = "Sword"|"Claymore"|"Catalyst"|"Bow"|"Polearm"