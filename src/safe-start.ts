import { spawn } from "node:child_process";
import { parseArgs } from "node:util";
import {
	type ResolvedConfig,
	configToFlags,
	readConfigFile,
} from "./config.ts";

const DEFAULT_CONFIG_PATH = "safestart.json";

function getArgValues() {
	return parseArgs({
		allowPositionals: true,
		options: {
			config: {
				type: "string",
				short: "c",
				optional: true,
			},
		},
	});
}

export function main() {
	const {
		values: { config },
		positionals,
	} = getArgValues();
	const [main] = positionals;
	if (!main) {
		throw new Error("No entry point provided");
	}
	const content = readConfigFile(config || DEFAULT_CONFIG_PATH);
	const resolvedConfig = configToFlags(content);
	const child = startNode(resolvedConfig, main);
	child.on("exit", () => {
		process.exit(0);
	});
}

function startNode(resolvedConfig: ResolvedConfig, main: string) {
	const { permission, flags } = resolvedConfig;
	const permissionFlags = Object.values(permission).flat();
	const genericFlags = Object.values(flags).flat();

	return spawn(
		"node",
		["--permission", ...genericFlags, ...permissionFlags, main],
		{
			detached: true,
			stdio: "inherit",
		},
	);
}
