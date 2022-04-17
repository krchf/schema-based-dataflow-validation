import Ajv from "ajv";
import { JSONSchema7 } from "json-schema";
import {
  extractInputMetadataSchema,
  extractMetadataTypeFromInstance,
  extractMetadataTypeFromSchema,
} from "../extraction";
import { Domain, Incompatibility, Metadata, MetadataSchema } from "../types";

export function validateInstanceAgainstSchema(
  instance: Metadata,
  schema: JSONSchema7
) {
  const incompatibilities: Incompatibility[] = [];
  const validate = new Ajv({ strict: false }).compile(schema);
  const valid = validate(instance);

  if (!valid) {
    for (const error of validate.errors) {
      incompatibilities.push({
        attribute: error.instancePath,
        reason: error.message,
      });
    }
  }

  return incompatibilities;
}

export function haveDifferentMetadataType(
  instance: Metadata,
  schema: MetadataSchema
) {
  const instanceType = extractMetadataTypeFromInstance(instance);
  const schemaType = extractMetadataTypeFromSchema(schema);

  return instanceType !== schemaType;
}

export async function validateInstanceCompatibility(
  domain: Domain,
  service: string,
  property: string,
  instance: Metadata
): Promise<Incompatibility[]> {
  let incompatibilities: Incompatibility[] = [];

  const consumingSchema = await extractInputMetadataSchema(
    domain,
    service,
    property
  );

  if (haveDifferentMetadataType(instance, consumingSchema)) {
    incompatibilities.push({
      reason: "incompatible types",
    });
  }

  incompatibilities = incompatibilities.concat(
    validateInstanceAgainstSchema(instance, consumingSchema)
  );

  return incompatibilities;
}
