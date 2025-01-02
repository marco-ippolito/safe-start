import { readFileSync } from "node:fs";
import { styleText } from "node:util";
import { resolve } from "node:path";

const flags = [
	"allow-addons",
	"allow-child",
	"allow-fs-read",
	"allow-fs-write",
	"allow-wasi",
	"allow-worker",
] as const;

type Flag = (typeof flags)[number];

export type Configuration = {
	[K in Flag]: string[] | string;
};

export type ResolvedConfiguration = {
	[K in keyof Configuration]: string[];
};

export function readConfigFile(path: string) {
	try {
		const file = readFileSync(path, "utf8");
		return JSON.parse(file);
	} catch (error) {
		console.error(styleText("red", `Config file "${path}" not found!`));
	}
}

export function configToFlags(config: Configuration) {
	const result = {} as ResolvedConfiguration;
	const allowedFlags = new Set(flags);

	for (const entry of Object.entries(config)) {
		const [key, value] = entry;
		if (!allowedFlags.has(key as Flag)) {
			throw new Error(`Invalid flag: ${key}`);
		}
		result[key] = [];
		// If the value is an array, we need to iterate over each item
		// and resolve the path to the item.
		const paths = Array.isArray(value) ? value : [value];

		for (const item of paths) {
			const resolved = resolveConfigItem(`--${key}`, item.trim());
			result[key].push(resolved);
		}
	}
	return result;
}

function resolveConfigItem(flag: string, item: string) {
	if (item.trim() !== "*") {
		const resolvedItem = resolve(item);
		return `${flag}=${resolvedItem}`;
	}
	return `${flag}=${item}`;
}
