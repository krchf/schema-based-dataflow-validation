import isJsonSchemaSubset, {
  SchemaCompatError,
} from "is-json-schema-subset/dist/is-json-schema-subset";
import { JSONSchema7 } from "json-schema";
import {
  extractInputMetadataSchema,
  extractMetadataTypeFromSchema,
  extractOutputMetadataSchema,
} from "../extraction";
import { Domain, Incompatibility, MetadataSchema } from "../types";

export async function outputSatisfiesInput(
  outputSchema: JSONSchema7,
  inputSchema: JSONSchema7,
  includeReason = true
): Promise<Incompatibility[]> {
  const incompatibilities: Incompatibility[] = [];

  const errors: SchemaCompatError[] = [];
  await isJsonSchemaSubset(outputSchema, inputSchema, false, errors);

  if (errors.length > 1) {
    incompatibilities.push({
      attribute: errors[0].paths.input[0] as string,
      reason: includeReason ? errors[0].args.join() : undefined,
    });
  }

  return incompatibilities;
}

export function haveDifferentMetadataType(
  firstSchema: MetadataSchema,
  secondSchema: MetadataSchema
): boolean {
  const firstType = extractMetadataTypeFromSchema(firstSchema);
  const secondType = extractMetadataTypeFromSchema(secondSchema);

  return firstType !== secondType;
}

export async function validateInterfaceCompatibility(
  domain: Domain,
  producingService: string,
  producingProperty: string,
  consumingService: string,
  consumingProperty: string
): Promise<Incompatibility[]> {
  let incompatibilities: Incompatibility[] = [];

  const producingSchema = await extractOutputMetadataSchema(
    domain,
    producingService,
    producingProperty
  );
  const consumingSchema = await extractInputMetadataSchema(
    domain,
    consumingService,
    consumingProperty
  );

  if (haveDifferentMetadataType(producingSchema, consumingSchema)) {
    incompatibilities.push({ reason: "different data types" });
  }

  const dereferencedProducingSchema = await extractOutputMetadataSchema(
    domain,
    producingService,
    producingProperty,
    { dereference: true }
  );
  incompatibilities = incompatibilities.concat(
    await outputSatisfiesInput(dereferencedProducingSchema, consumingSchema)
  );

  return incompatibilities;
}
