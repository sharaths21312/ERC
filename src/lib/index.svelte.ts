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

export function get_char_data(char: string) {
    return get_char_data_file()[char];
}

export function get_gear_data(gear: string) {
    return get_gear_data_file()[gear];
}

export const [get_data_file, set_data_file] = createContext<IDataSchema>();
export const [get_char_data_file, set_char_data_file] = createContext<Record<string, ICharacter>>();
export const [get_gear_data_file, set_gear_data_file] = createContext<Record<string, IGear>>();
export const [get_calculator_state, set_calculator_state] = createContext<ICalculatorState>();
export const [get_output_state, set_output_state] = createContext<IOutput>();

export class CalculatorConfig implements ICharacterConfig {
    name: string = $state("");
    sources: ICharacterSources[] = $state([]);
    gear: IGearSources[] = $state([]);
    burst_interval: number = 20;
    burst_count: number = 1;
    extra_flat_gen: number = 1;

    get data () {
        return get_char_data_file()[this.name];
    }

    constructor(name: string) {
        this.name = name;
        this.sources = [];
    }
}

export function create_empty_source() {
    return {
        index: 0,
        amount: 0,
        funnel: {
            active: false,
            to: 0,
            percentage: 100
        }
    };
}

export function create_empty_gear_source() {
    return {
        name: "Favonius",
        refine: 5,
        amount: 1,
        funnel: {
            active: false,
            to: 0,
            percentage: 100
        }
    };
}