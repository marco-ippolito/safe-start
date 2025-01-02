import { deepStrictEqual } from "node:assert";
import { resolve } from "node:path";
import { test } from "node:test";
import { permissionConfigToArgs } from "../src/config.ts";

const config = {
	"allow-addons": true,
	"allow-child": true,
	"allow-fs-read": ["/absolute/path/to/file", "./relative/path"],
	"allow-fs-write": "/foo/*",
	"allow-wasi": true,
	"allow-worker": false,
};

test("configToFlags should handle boolean flags and resolve paths for string flags", async () => {
	const result = permissionConfigToArgs(config);
	deepStrictEqual(result["allow-addons"], ["--allow-addons"]);
	deepStrictEqual(result["allow-child"], ["--allow-child"]);
	deepStrictEqual(result["allow-wasi"], ["--allow-wasi"]);
	deepStrictEqual(result["allow-worker"], []);
	deepStrictEqual(result["allow-fs-read"], [
		"--allow-fs-read=/absolute/path/to/file",
		`--allow-fs-read=${resolve("./relative/path")}`,
	]);
	deepStrictEqual(result["allow-fs-write"], ["--allow-fs-write=/foo/*"]);
});
