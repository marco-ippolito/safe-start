# Safe-Start Command

The `safe-start` command-line tool provides a simpler yet secure way to utilize the Node.js permission model.
It supports loading a configuration file and processing its contents, all while ensuring that permissions are handled in an easy-to-use manner.

## Installation

You can run the tool directly without installing it globally by using `npx`:

```sh
npx safe-start [options] [main]
```

It requires a configuration file, by default `safe-start.json` in the current working directory.
You can specify a different file using the `--config` option.
The `safe-start.json` file should be in the following format:

```json
{
    "permission": {
        "allow-addons": true,
        // All flags related to permission model
    },
    "flags": { // Optional
        "experimental-strip-types": true,
        // All other flags
    }
}
```

Values can be either a string or an array of strings.
Possible options are:

- `allow-addons`,
- `allow-child`,
- `allow-fs-read`,
- `allow-fs-write`,
- `allow-wasi`,
- `allow-worker`,

```json
{
    "permission": {
        "allow-addons": true,
        "allow-fs-write": "/foo/*",
        "allow-fs-read": ["./bar/*", "./baz/*"],
    }
}
```
