export type TElement = "Pyro" | "Hydro" | "Dendro" | "Electro" | "Cryo" | "Anemo" | "Geo" | "None";

export type TParticleGenType = "particle" | "flat" | "particle_turret" | "flat_turret";

export type TParticleTarget = "all" | "self" | "notself" | "onfield";

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