import { JSONSchema7, JSONSchema7Object } from "json-schema";

export type Domain = JSONSchema7;
export type MatadataDefinition = { [name: string]: JSONSchema7 };
export type MetadataSchema = JSONSchema7;
export type Metadata = { $schema: string; [key: string]: any };

// export type Incompatibility = string;
export interface Incompatibility {
  attribute?: string;
  reason: string;
}
