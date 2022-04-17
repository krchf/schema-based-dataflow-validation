import { JSONSchema7 } from "json-schema";
import {
  domain,
  inDemandForecast,
  inTechnologyForecast,
  outDemandForecast,
  svcDemandForecast,
  svcTopologyOptimization,
} from "../example-domain";
import {
  extractInputMetadataSchema,
  extractOutputMetadataSchema,
} from "../extraction";
import { Domain, MetadataSchema } from "../types";
import {
  haveDifferentMetadataType,
  outputSatisfiesInput,
  validateInterfaceCompatibility,
} from "./interface-validation";

describe("validation of metadata types", () => {
  it("detects unequal types", async () => {
    expect(
      haveDifferentMetadataType(
        await extractInputMetadataSchema(
          domain,
          svcDemandForecast,
          inTechnologyForecast
        ), // = TechnologyForecast
        await extractInputMetadataSchema(
          domain,
          svcTopologyOptimization,
          inDemandForecast
        ) // = DemandForecast
      )
    ).toEqual(true);
  });

  it("detects equal types", async () => {
    expect(
      haveDifferentMetadataType(
        await extractOutputMetadataSchema(
          domain,
          svcDemandForecast,
          outDemandForecast
        ),
        await extractInputMetadataSchema(
          domain,
          svcTopologyOptimization,
          inDemandForecast
        )
      )
    ).toEqual(false);
  });
});

function createForecastSchema(constraints: JSONSchema7): MetadataSchema {
  return {
    definitions: {
      Resolution: { enum: ["Yearly", "Daily", "Hourly"] },
      DemandForecast: {
        properties: {
          resolution: { $ref: "#/definitions/Resolution" },
        },
      },
    },
    allOf: [
      {
        $ref: "#/definitions/DemandForecast",
      },
      {
        type: "object",
        properties: {
          resolution: constraints,
        },
      },
    ],
  };
}

describe("validation of schema subset", () => {
  describe("value-based", () => {
    it("passes for compatible const", async () => {
      expect(
        await outputSatisfiesInput(
          createForecastSchema({ const: "Daily" }),
          createForecastSchema({ const: "Daily" })
        )
      ).toEqual([]);
    });

    it("fails for incompatible const", async () => {
      expect(
        await outputSatisfiesInput(
          createForecastSchema({ const: "Yearly" }),
          createForecastSchema({ const: "Daily" }),
          false
        )
      ).toEqual([{ attribute: "resolution" }]);
    });

    it("passes for compatible enums", async () => {
      expect(
        await outputSatisfiesInput(
          createForecastSchema({ enum: ["Daily"] }),
          createForecastSchema({ enum: ["Daily", "Hourly"] })
        )
      ).toEqual([]);
    });

    /* TODO: const/enum somehow not supported by library */

    // it("passes for compatible const/enum", async () => {
    //   expect(
    //     await outputSatisfiesInput(
    //       createForecastSchema({ const: "Daily" }),
    //       createForecastSchema({ enum: ["Daily"] })
    //     )
    //   ).toEqual([]);
    // });
  });

  describe("reference-based", () => {
    it("passes for compatible reference", async () => {
      const producingSchema = await extractOutputMetadataSchema(
        domain,
        svcDemandForecast,
        outDemandForecast,
        { dereference: true }
      );
      const consumingSchema = await extractInputMetadataSchema(
        domain,
        svcTopologyOptimization,
        inDemandForecast
      );
      expect(
        await outputSatisfiesInput(producingSchema, consumingSchema)
      ).toEqual([]);
    });

    it("fails for incompatible reference", async () => {
      const modifiedDomain: Domain = JSON.parse(JSON.stringify(domain));
      modifiedDomain.properties[svcDemandForecast]["properties"]["inputs"][
        "properties"
      ][inTechnologyForecast]["allOf"][1] = {
        type: "object",
        properties: {
          resolution: {
            const: "some-incompatible-resolution",
          },
        },
      };
      const producingSchema = await extractOutputMetadataSchema(
        modifiedDomain,
        svcDemandForecast,
        outDemandForecast,
        { dereference: true }
      );
      const consumingSchema = await extractInputMetadataSchema(
        domain,
        svcTopologyOptimization,
        inDemandForecast
      );
      expect(
        await outputSatisfiesInput(producingSchema, consumingSchema, false)
      ).toEqual([
        {
          attribute: "resolution",
        },
      ]);
    });
  });
});

describe("validation of interface compatibility", () => {
  it("should work", async () => {
    expect(
      await validateInterfaceCompatibility(
        domain,
        svcDemandForecast,
        outDemandForecast,
        svcTopologyOptimization,
        inDemandForecast
      )
    ).toEqual([]);
  });
});
