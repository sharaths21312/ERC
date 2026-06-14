import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TElement, IDataSchema, ICharacter, IGear, ICharacterSources, ICharacterConfig, IGearSources, ICalculatorState, IOutput, IOutputElt } from "./datatypes";
import { createContext } from "svelte";

export function particleTransferFrac(eltsource: TElement, eltprod: TElement) {
    if (eltsource == eltprod) return 3;
    else if (eltprod == "None") return 2;
    else return 1;
}

export function sum(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0);
}

export function remap(val: number, old_min: number, old_max: number, new_min: number, new_max: number) {
    return ((val - old_min) / (old_max - old_min)) * (new_max - new_min) + new_min;
}

export function remap_refine(base: number, multiplier: number, refine: number) {
    return remap(refine, 1, 5, base, base * multiplier);
}


export const [get_data_file, set_data_file] = createContext<IDataSchema>();
export const [get_char_data_file, set_char_data_file] = createContext<Record<string, ICharacter>>();
export const [get_gear_data_file, set_gear_data_file] = createContext<Record<string, IGear>>();
export const [get_calculator_state, set_calculator_state] = createContext<ICalculatorState>();
export const [get_output_state, set_output_state] = createContext<IOutput>();

export function createCharacter(name: string, data: Record<string, ICharacter>): ICharacterConfig {
    return {
        name,
        bursts: {
            source_idx: 0,
            interval: 20,
            rot_count: 1
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

export function create_empty_source(): ICharacterSources {
    return {
        source_idx: 0,
        amount: 1,
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
        refine: 5,
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