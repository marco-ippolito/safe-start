#!/usr/bin/env node --permission --allow-fs-read=*

import { parseArgs } from "node:util";
import { readConfigFile } from "./config.ts";

const DEFAULT_CONFIG_PATH = "safestart.json";

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: {
		config: {
			type: "string",
			short: "c",
			optional: true,
		},
	},
});

const { config } = values;

const content = readConfigFile(config || DEFAULT_CONFIG_PATH);

if (!content) {
	process.exit(1);
}

const [main] = positionals;
