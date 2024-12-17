export type TrawCharacterData = {
    names: string[],
    element: TElement,
    weapon: TWeapon,
    particlesources: TparticleSource[]
}

export type TcharacterEnergyState = {
    name: string,
    sources: TparticleSource[]
}

export type TcharacterEnergyGeneration = {
    name: string,
    element: TElement,
    amountPerSecond: Number
}

export type TparticleSource = {
    label: string,
    amount: number,
    cooldown: Number,
    duration?: Number,
    energytype: "Turret"|"Flat"|"Instant"
}

export type TcharacterParticleGeneration = {
    amount: number,
    type: TElement,
    generationType: "Turret"|"Flat"|"Instant"
    isFunnel: boolean,
    funnelTo: string[],
    funnelChar: number[]
}[]

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
    rotationMode: string,
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