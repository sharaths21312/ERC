import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TcharsSelected, TElement, TrawCharacterData, TtotalParticleGeneration } from "./datatypes";

export const charsSelected: Writable<TcharsSelected> = $state(writable([]));


export function particleTransferFrac(eltsource: TElement, eltprod: TElement) {
    if (eltsource == eltprod) return 3;
    else if (eltprod == "None") return 2;
    else return 1;
}

export function sum(nums: number[]) {
    return nums.reduce((a, b) => a + b, 0);
}

export class charNameText {
    validation: string[] = []

    #char = $state("")
    get char() {
        return this.#char
    }
    set char(value: string) {
        if (this.validation.includes(value)) {
            this.#char = value
            return;
        }
    }
    
    constructor(name: string, validation: string[]) {
        this.validation = validation
        this.#char = name
    }
}