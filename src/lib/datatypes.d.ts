export type TElement = "Pyro" | "Hydro" | "Dendro" | "Electro" | "Cryo" | "Anemo" | "Geo" | "None";

export type TParticleGenType = "particle" | "flat" | "particle_turret" | "flat_turret";

export type TParticleTarget = "all" | "self" | "notself" | "onfield";

export type TCharIdx = 0 | 1 | 2 | 3;

export interface IParticleGenEntry {
	type: TParticleGenType;
	element?: TElement;
	amount: number;
	target?: TParticleTarget;
	rng_reduction?: number;
	duration?: number;
}

export interface IBurst {
	cooldown: number;
	energy: number;
	name: string;
}

export interface ISource {
	title: string;
	cooldown: number;
	gen: IParticleGenEntry[];
}

export interface ICharacter {
	names: string[];
	help?: string;
	element: TElement;
	bursts: IBurst[];
	sources: ISource[];
}

export interface IGear {
	names: string[];
	gen: IParticleGenEntry[];
	refine_scaling?: number;
	help: string | undefined;
}

export interface IDataSchema {
	characters: ICharacter[];
	gear: IGear[];
}

export interface ICalculatorState {
	0: ICharacterConfig | null;
	1: ICharacterConfig | null;
	2: ICharacterConfig | null;
	3: ICharacterConfig | null;
	general: IGeneralConfig;
}

export interface IGeneralConfig {
	hp_threshold_energy: "default" | "none" | "custom";
	hp_threshold_energy_custom: number;
	rotation_type: "fixed" | "flexible";
	rotation_length: number;
	total_duration: number;
	electro_resonance_interval: number;
	energy_pessimism: number; // 0 -> default, 1 -> worst case
}

export interface ICharacterConfig {
	name: string;
	sources: ICharacterSource[];
	gear: IGearSources[];
	fieldtime: number;
	bursts: IBurstSelection;
	extra_flat_gen: number;
}

export interface IBurstSelection {
	source_idx: number;
	interval: number;
	rot_count: number;
}

export interface ICharacterSource {
	source_idx: number;
	num_uses: number;
	funnel: IFunnelEntry;
}

export interface IGearSources {
	name: string;
	last_valid_name: string;
	refine?: number;
	funnel: IFunnelEntry;
	amount: number;
}

export interface IFunnelEntry {
	active: boolean;
	to: TCharacterIndex;
	percentage: number;
}

export interface IOutput {
	0: IOutputElt | null;
	1: IOutputElt | null;
	2: IOutputElt | null;
	3: IOutputElt | null;
}

export interface IOutputElt {
	particle_in: number[];
	particle_in_gear: number[];
	flat_gen: number[];
	flat_gen_gear: number[];
	er_req: number;
}

export type TStoredData = IStoredData_V1;

export interface IStoredData_V1 {
	saves: {
		name: string;
		last_er: number[];
		state: ICalculatorState;
	}[];
	version: 1;
	custom_chars: ICharacter[];
	custom_gear: IGear[];
	last_save?: ICalculatorState;
}

export interface ISaveFuncs {
	reset: () => void;
	reset_all: () => void;
	save: (string, IOutput) => void;
	load: (number) => void;
}