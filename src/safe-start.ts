import { fork, spawn } from "node:child_process";
import { parseArgs } from "node:util";
import { configToFlags, readConfigFile } from "./config.ts";

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

function startNode(resolvedConfig, main) {
	const flags = Object.values(resolvedConfig) as string[];
	console.log(flags);
	return spawn("node", ["--permission", ...flags, main], {
		detached: true,
		stdio: "inherit",
	});
}
