# Detection of Data Incompatibilities in Process-Driven DSS based on JSON Schema

This repository contains a command-line application for validation of interface and instance compatibility in process-driven decision support systems.

## Setup

Prerequisites: [Node.js](https://nodejs.org/en/) and npm

1. Run `npm install` to install dependencies.
2. Run `npm run generate-demo-data` to populate `demo` directory. (This command can be run again to undo any modifications described below.)

## Validation of Interface Compatibility

For a demo of interface compatibility validation, run `npm run validate-interface-compatibility`.
The command is a shorthand for

```
npm run cli -- validate-interface-compatibility -d demo/domain.json -p DemandForecast/demandForecast -c TopologyOptimization/demandForecast
```

It validates that the data produced as _demandForecast_ by the _DemandForecast_ service can be consumed as _demandForecast_ by the _TopologyOptimization_ service. Services interfaces are documented in the `domain.json` file.

Execution of the command should print that no incompatibilities were found.

Now change the resolution of the _technologyForecast_ consumed by the _DemandForecast_ from `"Yearly"` to `"Hourly"` (around line 60 in `domain.json`). After running the previous command again, the validation should output the added incompatibility.

Undo any changes and run

```
npm run cli -- validate-interface-compatibility -d demo/domain.json -p DemandForecast/demandForecast -c TopologyOptimization/currentTopology
```

The validation should output that the data cannot be exchanged between services due to incompatible data types, i.e, the _demandForecast_ produced by the _DemandForecast_ service cannot be used as a _currentTopology_ of the _TopologyOptimization_ service.

## Validation of Instance Compatibility

For a demo of instance compatibility validation, run `npm run validate-instance-compatibility`.

The command is a shorthand for

```
npm run cli -- validate-instance-compatibility -d demo/domain.json -m demo/metadata.json -c TopologyOptimization/currentTopology
```

It validates that the data instance characterized by the metadata in `metadata.json` can be consumed as _currentTopology_ parameter of the _TopologyOptimization_ service.

Execution of the command should print that no incompatibilities were found.

Now change the `size` of in the `metadata.json` to 150. After running the previous command again, the validation should output the added incompatibility in the size attribute.

As an alternative to changing the value of `size`, it is also possible to change the `$schema` from `NetworkTopology` to `DemandForecast`. After running the previous command again, the validation should output the added incompatibility in the data type.

### Acknowledgements

This software uses the third-party libraries documented in `dependencies` and `devDependencies` of `package.json`.

In particular, [_is-json-schema-subset_](https://github.com/haggholm/is-json-schema-subset) provides fundamental functionality for interface validation and [_AJV_](https://github.com/ajv-validator/ajv) provides fundamental functionality for instance validation.
