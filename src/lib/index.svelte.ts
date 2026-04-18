import { get, writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TElement, IDataSchema, ICharacter, IGear } from "./datatypes";
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