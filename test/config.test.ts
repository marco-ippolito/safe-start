import { deepStrictEqual } from "node:assert";
import { resolve } from "node:path";
import { test } from "node:test";
import { configToFlags } from "../src/config.ts";

const config = {
	"allow-addons": ["./addon1", "/absolute/addon2", "*"],
	"allow-child": "./child1",
	"allow-fs-read": "/absolute/path/to/file",
	"allow-fs-write": "/foo/*",
	"allow-wasi": "relative/path/to/wasi",
	"allow-worker": "/absolute/worker",
};

test("configToFlags should convert relative paths to absolute paths and handle folders", async () => {
	const result = configToFlags(config);
	deepStrictEqual(result["allow-addons"], [
		`--allow-addons=${resolve("./addon1")}`,
		"--allow-addons=/absolute/addon2",
		"--allow-addons=*",
	]);
	deepStrictEqual(result["allow-child"], [
		`--allow-child=${resolve("./child1")}`,
	]);
	deepStrictEqual(result["allow-fs-read"], [
		"--allow-fs-read=/absolute/path/to/file",
	]);
	deepStrictEqual(result["allow-fs-write"], ["--allow-fs-write=/foo/*"]);
	deepStrictEqual(result["allow-wasi"], [
		`--allow-wasi=${resolve("relative/path/to/wasi")}`,
	]);
	deepStrictEqual(result["allow-worker"], ["--allow-worker=/absolute/worker"]);
});
