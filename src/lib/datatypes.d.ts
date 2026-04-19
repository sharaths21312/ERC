export type TElement = "Pyro" | "Hydro" | "Dendro" | "Electro" | "Cryo" | "Anemo" | "Geo" | "None";

export type TParticleGenType = "particle" | "flat" | "particle_turret" | "flat_turret";

export type TParticleTarget = "all" | "self" | "notself" | "onfield";

export type TCharacterIndex = 0 | 1 | 2 | 3;

export interface IParticleGenBase {
	type: TParticleGenType;
	element: TElement;
	amount: number;
	target?: TParticleTarget;
	rng_reduction?: number;
}

export interface IParticleGenNonTurret extends IParticleGenBase {
	type: "particle" | "flat";
}

export interface IParticleGenTurret extends IParticleGenBase {
	type: "particle_turret" | "flat_turret";
	duration: number;
}

export type TParticleGenEntry = IParticleGenNonTurret | IParticleGenTurret;

export interface IBurst {
	cooldown: number;
	energy: number;
}

export interface ISource {
	title: string;
	cooldown: number;
	gen: TParticleGenEntry[];
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
	gen: TParticleGenEntry[];
	refine_scaling?: number;
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
	data: ICharacter;
	sources: ICharacterSources[];
	gear: IGearSources[];
	burst_interval: number;
	extra_flat_gen: number;
}

export interface ICharacterSources {
	source_idx: number;
	amount: number;
	funnel: IFunnelEntry;
}

export interface IGearSources {
	name: string;
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
	flat_gen: number[];
	// energy
}