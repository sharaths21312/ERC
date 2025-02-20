import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TcharsSelected, TElement } from "./datatypes";

export const charsSelected: Writable<TcharsSelected> = $state(writable([]));

export function particleTransferFrac(eltsource: TElement, eltprod: TElement) {
    if (eltsource == eltprod) return 3;
    else if (eltprod == "None") return 2;
    else return 1;
}

export function sum(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0);
}