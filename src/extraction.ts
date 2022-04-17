import * as RefParser from "@apidevtools/json-schema-ref-parser";
import { JSONSchema7, JSONSchema7Object } from "json-schema";
import { Domain, Metadata, MetadataSchema } from "./types";

export function extractMetadataSchema(type: "inputs" | "outputs") {
  return async (
    domain: Domain,
    service: string,
    parameter: string,
    options?: {
      dereference: boolean;
    }
  ) => {
    const schema: Domain = options?.dereference
      ? ((await RefParser.dereference(
          JSON.parse(JSON.stringify(domain))
        )) as Domain)
      : domain;

    const definitions = domain.definitions;
    let metadataSchema = (schema.properties[service] as JSONSchema7Object)
      .properties[type].properties[parameter];

    return {
      definitions,
      ...metadataSchema,
    };
  };
}

export const extractInputMetadataSchema = extractMetadataSchema("inputs");
export const extractOutputMetadataSchema = extractMetadataSchema("outputs");

export function extractMetadataTypeFromSchema(schema: MetadataSchema): string {
  return (schema.allOf[0] as JSONSchema7).$ref;
}

export function extractMetadataTypeFromInstance(instance: Metadata): string {
  return instance.$schema;
}
