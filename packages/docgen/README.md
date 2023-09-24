<h1 align="center">
    <img src="https://i.imgur.com/DWM0tJL.png" width="50%">
    <br>
</h1>

<h3 align="center">
    <a href="https://discord.gg/VzP8qW7Z8d">
        <img src="https://img.shields.io/discord/993105237000855592?color=5865F2&logo=discord&logoColor=white">
    </a>
    <a href="https://npmjs.org/package/reciple">
        <img src="https://img.shields.io/npm/v/reciple?label=npm">
    </a>
    <a href="https://github.com/FalloutStudios/Reciple/blob/main/LICENSE">
        <img src="https://img.shields.io/npm/dt/reciple.svg?maxAge=3600">
    </a>
    <a href="https://www.codefactor.io/repository/github/falloutstudios/reciple/overview/main">
        <img src="https://www.codefactor.io/repository/github/falloutstudios/reciple/badge/main">
    </a>
</h3>

## About

`@reciple/docgen` parses Typescript file to generate json file for documentation

## Usage

```sh
npx reciple-docgen -i ./src/index.ts -c ./docs/custom.json -o ./docs/docs.json
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
