<h1 align="center">
    <img src="/assets/reciple-contained.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.ggthenorthsolution1">
        <img src="https://img.shields.io/discord/1032785824686817291?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/@reciple/docgen">
        <img src="https://img.shields.io/npm/v/%40reciple/docgen?label=npm">
    </a>
    <a href="https://github.com/thenorthsolution/Reciple/tree/main/packages/docgen">
        <img src="https://img.shields.io/npm/dt/%40reciple/docgen?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
    <br>
    <div style="padding-top: 1rem">
        <a href="https://discord.ggthenorthsolution1">
            <img src="https://discord.com/api/guilds/1032785824686817291/embed.png?style=banner2">
        </a>
    </div>
</h3>

---

## About

`@reciple/docgen` parses Typescript files to generate json file for documentation

## Usage

```sh
reciple-docgen -i ./src/index.ts -c ./docs/custom.json -o ./docs/docs.json
```

```sh
Usage: reciple-docgen [options]

Options:
  -V, --version            output the version number
  -i, --input <string...>  Source files to parse docs in
  -c, --custom [string]    Custom docs pages file to use
  -r, --root [string]      Project root directory (default: ".")
  --readme [string]        README.md path location (default: "README.md")
  -o, --output <string>    Path to output file
  -p, --pretty             Pretty print JSON output
  -h, --help               display help for command
```
