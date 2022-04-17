import { program } from "commander";
import { readFileSync } from "fs";
import { validateInstanceCompatibility } from "./instance-validation";
import { validateInterfaceCompatibility } from "./interface-validation/interface-validation";
import { Incompatibility } from "./types";

function readJson(filename: string) {
  return JSON.parse(readFileSync(filename).toString());
}

function printGoal(
  consumingService: string,
  consumingProperty: string,
  producingService?: string,
  producingProperty?: string
) {
  if (producingService) {
    console.log(
      `Validating that the data '${producingProperty}' produced by service '${producingService} can be consumed as '${consumingProperty}' of service '${consumingService}' ...`
    );
  } else {
    console.log(
      `Validating that the data instance characterized by the metadata can be consumed as '${consumingProperty}' of service '${consumingService}': \n`
    );
  }
}

function printIncompatibilities(incompatibilities: Incompatibility[]) {
  if (incompatibilities.length === 0) {
    console.log("no incompatibilities detected");
  } else {
    console.log("detected the following incompatibilities:");
    for (const incompat of incompatibilities) {
      console.log("attribute:", incompat.attribute);
      console.log("reason:", incompat.reason);
      console.log("\n");
    }
  }
}

function printTime(startTime: number, endTime: number) {
  console.log("Validation finished after", endTime - startTime, "ms.");
}

program
  .requiredOption("-d, --domain <filename>")
  .requiredOption("-c, --consuming <service/property>");

program
  .command("validate-interface-compatibility")
  .requiredOption("-p, --producing <service/property>")
  .action(async (cmdOptions) => {
    const opts = {
      ...program.optsWithGlobals(),
      ...cmdOptions,
    };
    const { consuming, producing } = opts;
    const [producingService, producingProperty] = producing.split("/");
    const [consumingService, consumingProperty] = consuming.split("/");
    const domain = readJson(opts.domain);

    printGoal(
      consumingService,
      consumingProperty,
      producingService,
      producingProperty
    );

    const startTime = Date.now();
    const incompatibilities = await validateInterfaceCompatibility(
      domain,
      producingService,
      producingProperty,
      consumingService,
      consumingProperty
    );
    const endTime = Date.now();

    printIncompatibilities(incompatibilities);
    printTime(startTime, endTime);
  });

program
  .command("validate-instance-compatibility")
  .option("-m, --metadata <filename>")
  .action(async (cmdOptions) => {
    const opts = {
      ...program.optsWithGlobals(),
      ...cmdOptions,
    };
    const { consuming } = opts;
    const [consumingService, consumingProperty] = consuming.split("/");
    const domain = readJson(opts.domain);
    const metadata = readJson(opts.metadata);

    printGoal(consumingService, consumingProperty);

    const startTime = Date.now();
    const incompatibilities = await validateInstanceCompatibility(
      domain,
      consumingService,
      consumingProperty,
      metadata
    );
    const endTime = Date.now();

    printIncompatibilities(incompatibilities);
    printTime(startTime, endTime);
  });

program.parse();
