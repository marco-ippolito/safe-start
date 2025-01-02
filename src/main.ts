#!/usr/bin/env node --permission --allow-fs-read=* --allow-child-process --disable-warning=SecurityWarning

import { styleText } from "node:util";
import { main } from "./safe-start.ts";

try {
	main();
} catch (error) {
	console.error(styleText("red", `[ERROR]: ${error.message}`));
	process.exit(1);
}
