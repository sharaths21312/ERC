import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TElement, IDataSchema, ICharacter, IGear, ICharacterSource, ICharacterConfig, IGearSources, ICalculatorState, IOutput, IOutputElt, IParticleGenEntry, TCharIdx, TStoredData, ISaveFuncs } from "$lib/datatypes";
import { createContext } from "svelte";

export function particleTransferFrac(eltsource: TElement, eltprod: TElement) {
    if (eltsource == eltprod) return 3;
    else if (eltprod == "None") return 2;
    else return 1;
}

export function sum(nums: (number | undefined)[]): number {
    return nums.reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;
}

export function remap(val: number, old_min: number, old_max: number, new_min: number, new_max: number) {
    return ((val - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min;
}

export function remap_refine(base: number, multiplier: number, refine: number) {
    return remap(refine, 0, 4, base, base * multiplier);
}


export const [get_data_file, set_data_file] = createContext<IDataSchema>();
export const [get_char_data_file, set_char_data_file] = createContext<Record<string, ICharacter>>();
export const [get_gear_data_file, set_gear_data_file] = createContext<Record<string, IGear>>();
export const [get_calculator_state, set_calculator_state] = createContext<ICalculatorState>();
export const [get_output_state, set_output_state] = createContext<() => IOutput>();
export const [get_stored_data, set_stored_data] = createContext<TStoredData>();
export const [get_reset_funcs, set_reset_funcs] = createContext<ISaveFuncs>()

export function createCharacter(name: string, data: Record<string, ICharacter>): ICharacterConfig {
    return {
        name,
        bursts: {
            source_idx: 0,
            interval: 20,
            rot_count: name == "Flins" ? 2 : 1
        },
        extra_flat_gen: 0,
        fieldtime: 1,
        sources: [create_empty_source()],
        gear: []
    };
}

export function getDataGenerator(data: Record<string, ICharacter>) {
    return (name: string) => data[name];
}

export function getGearDataGenerator(data: Record<string, IGear>) {
    return (gear: IGearSources) => {
        let valid_name = caseInsensitiveSearch(gear.name, Object.keys(data));
        if (valid_name) {
            return data[valid_name]
        } else {
            return data[gear.last_valid_name]
        }
    };
}

export function create_empty_source(): ICharacterSource {
    return {
        source_idx: 0,
        num_uses: 1,
        funnel: {
            active: false,
            to: 0,
            percentage: 100
        }
    };
}

export function create_empty_gear_source(): IGearSources {
    return {
        name: "Favonius",
        last_valid_name: "Favonius",
        refine: 4,
        amount: 1,
        funnel: {
            active: false,
            to: 0,
            percentage: 100
        }
    };
}

export function caseInsensitiveSearch(str: string, arr: string[]) {
    return arr.filter(s => s.toLowerCase() == str.toLowerCase())?.[0];
}

export function distinct(arr: any[]) {
    return [...new Set(arr)];
}

export const single_output: IOutputElt = {
    particle_in: [0, 0, 0, 0, 0, 0],
    particle_in_gear: [0, 0, 0, 0],
    flat_gen: [0, 0, 0, 0, 0],
    flat_gen_gear: [0, 0, 0, 0],
    er_req: 1.1
}

export function eltmulti(self: TElement, other: TElement) {
    if (other == self) {
        return 3
    } else if (other == "None") {
        return 2
    } else {
        return 1
    }
}

/**
 * @param {number} fieldtime Number between 0 and 1
 * @param {number} cidx The character receiving the particles
 * @param {number} oidx The character giving the particles
 * 
 * Returns a number between 0 and 1 combining the fieldtime fraction and funnel fraction
 * 
 * implemented:
 * - flat and flat_turret self/notself/onfield/all
 * - particle and particle_turret default
 */
export function funnelAndFieldtime(input_config: ICharacterSource | IGearSources, source: IParticleGenEntry, cidx: TCharIdx, oidx: TCharIdx, fieldtime: number, numchars: number): number {
    const off_mult = numchars > 1 ? 1 - numchars * 0.1 : 1
    const isparticle = isParticle(source);
    const funnel_fraction = Math.max(0, Math.min(input_config.funnel.percentage/100, 1))

    // Flat: all - 1 for everyone, can be funnelled; self - 1 for self, notself - 1 for not self; onfield - distribute on fieldtime, can be funnelled
    if (!isparticle && !input_config.funnel.active) {
        switch (source.target ?? "self") {
            case "all":
                return 1
            case "self":
                return cidx == oidx ? 1 : 0
            case "notself":
                return cidx == oidx ? 0 : 1
            case "onfield":
                if (input_config.funnel.active) {
                    if (cidx == input_config.funnel.to) {
                        return funnel_fraction + (1 - funnel_fraction) * fieldtime
                    } else {
                        return (1 - funnel_fraction) * fieldtime
                    }
                } else {
                    return fieldtime
                }
        }
    }

    // Particle gen - 1 if current, 0.6 if otherwise, affected by funnel
    if (source.type == "particle") {
        let neutral_share = cidx == oidx ? 1 : off_mult
        if (input_config.funnel.active) {
            if (cidx == input_config.funnel.to) {
                return funnel_fraction + (1 - funnel_fraction) * neutral_share;
            } else {
                return funnel_fraction * off_mult + (1 - funnel_fraction) * neutral_share;
            }
        } else {
            return neutral_share;
        }
    }

    // Particle turret, distribute based on fieldtime, unaffected by funnel
    if (source.type == "particle_turret") {
        return fieldtime + off_mult * (1 - fieldtime)
    }

    return 1
}

export function isParticle(source: IParticleGenEntry) {
    return source.type == "particle" || source.type == "particle_turret"
}

export function getRNGGen(source: IParticleGenEntry, safety: number) {
    if (source.type.includes("flat")) {
        return source.amount;
    }

    let wc: number = 0;
    if (source.type == "particle") {
        wc = source.rng_reduction ?? Math.floor(source.amount)
    } else if (source.type == "particle_turret") {
        wc = source.rng_reduction ?? source.amount/2
    }
    return remap(safety, 0, 1, wc, source.amount)
}