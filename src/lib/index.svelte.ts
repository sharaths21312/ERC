import { writable } from "svelte/store";
import type { Writable } from "svelte/store";
import type { TcharsSelected } from "./datatypes";

export const charsSelected: Writable<TcharsSelected> = $state(writable({}));

export class favGen {
    amount = $state(0)
    isFunnel = $state(false)
    #funnelAmt = $state(100)
    funnelChar = $state(0)

    get funnelAmt() {
        return this.#funnelAmt;
    }
    set funnelAmt(value: number) {
        this.#funnelAmt = Math.max(Math.min(value, 100), 0);
    }

    constructor() {}
}