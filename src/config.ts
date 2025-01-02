import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const booleanFlags = [
	"allow-addons",
	"allow-child",
	"allow-wasi",
	"allow-worker",
] as const;

const stringFlags = ["allow-fs-read", "allow-fs-write"] as const;

type BooleanPermissionFlag = (typeof booleanFlags)[number];
type StringPermissionFlag = (typeof stringFlags)[number];
type PermissionFlag = BooleanPermissionFlag | StringPermissionFlag;
type GenericFlag = string | string[] | boolean;

type Configuration = {
	permission: PermissionConfiguration;
	flags?: Record<string, string[]>;
};

type PermissionConfiguration = {
	[K in PermissionFlag]?: K extends BooleanPermissionFlag
		? boolean
		: string[] | string;
};

type ResolvedPermissionConfiguration = {
	[K in StringPermissionFlag | BooleanPermissionFlag]: string[];
};

export type ResolvedConfig = {
	permission: ResolvedPermissionConfiguration;
	flags: Record<string, string[]>;
};

export function readConfigFile(path: string): Configuration {
	try {
		const file = readFileSync(path, "utf8");
		return JSON.parse(file) as Configuration;
	} catch (error) {
		throw new Error(`Failed to read config file: ${error.message}`);
	}
}

export function permissionConfigToArgs(
	permissionConfig: PermissionConfiguration,
): ResolvedPermissionConfiguration {
	const result = {};

	for (const [key, value] of Object.entries(permissionConfig)) {
		// Initialize the array for the flag
		result[key] = [];

		// Check if the key is a boolean flag like --allow-wasi
		if (booleanFlags.includes(key as BooleanPermissionFlag)) {
			if (typeof value !== "boolean") {
				throw new Error(`Invalid value for boolean flag: ${key}`);
			}
			if (value) {
				result[key].push(`--${key}`);
			} else {
				console.log(`Skipping ${key} flag`);
			}
			// Check if the key is a string flag like --allow-fs-read
		} else if (stringFlags.includes(key as StringPermissionFlag)) {
			// Value could be either string or array of strings
			const paths = Array.isArray(value) ? value : [value];
			for (const item of paths) {
				if (typeof item !== "string") {
					throw new Error(`Invalid value for string flag: ${key}`);
				}
				// For each value (a, b) we pass it as --flag=a and --flag=b
				const resolved = resolveConfigItem(`--${key}`, item.trim());
				result[key].push(resolved);
			}
		} else {
			throw new Error(`Invalid flag: ${key}`);
		}
	}

	return result as ResolvedPermissionConfiguration;
}

function flagsConfigToArgs(
	flagsConfig: Record<string, GenericFlag>,
): Record<string, string[]> {
	const result = {};
	for (const [key, value] of Object.entries(flagsConfig)) {
		// Initialize the array for the flag
		result[key] = [];

		if (typeof value === "boolean") {
			if (value) {
				result[key].push(`--${key}`);
			} else {
				console.log(`Skipping ${key} flag`);
			}
			continue;
		}

		// Value could be either string or array of strings
		const paths = Array.isArray(value) ? value : [value];
		for (const item of paths) {
			// For each value (a, b) we pass it as --flag=a and --flag=b
			const resolved = `--${key}=${item}`;
			result[key].push(resolved);
		}
	}
	return result;
}

export function configToFlags(config: Configuration) {
	if (!config.permission) {
		throw new Error("Invalid configuration, missing permission field");
	}
	return {
		permission: permissionConfigToArgs(config.permission),
		flags: flagsConfigToArgs(config.flags || {}),
	};
}

function resolveConfigItem(flag: string, item: string): string {
	// Skip if the item is a wildcard
	if (item !== "*") {
		const resolvedItem = resolve(item);
		return `${flag}=${resolvedItem}`;
	}
	return `${flag}=${item}`;
}
