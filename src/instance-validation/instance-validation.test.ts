import {
  domain,
  inCurrentTopology,
  svcTopologyOptimization,
} from "../example-domain";
import { extractInputMetadataSchema } from "../extraction";
import {
  haveDifferentMetadataType,
  validateInstanceAgainstSchema,
  validateInstanceCompatibility,
} from "./instance-validation";

describe("validation of metadata type", () => {
  it("passes for compatible types", async () => {
    expect(
      haveDifferentMetadataType(
        {
          $schema: "#/definitions/DemandForecast",
        },
        await extractInputMetadataSchema(
          domain,
          svcTopologyOptimization,
          inCurrentTopology
        )
      )
    ).toEqual(true);
  });

  it("fails for incompatible types", async () => {
    expect(
      haveDifferentMetadataType(
        {
          $schema: "#/definitions/NetworkTopology",
        },
        await extractInputMetadataSchema(
          domain,
          svcTopologyOptimization,
          inCurrentTopology
        )
      )
    ).toEqual(false);
  });
});

describe("validation of instance against schema", () => {
  it("passes for a compatible instance", async () => {
    const schema = await extractInputMetadataSchema(
      domain,
      svcTopologyOptimization,
      inCurrentTopology
    );

    expect(
      validateInstanceAgainstSchema(
        {
          $schema: "",
          size: 50,
        },
        schema
      )
    ).toEqual([]);
  });

  it("fails for an incompatible instance", async () => {
    const schema = await extractInputMetadataSchema(
      domain,
      svcTopologyOptimization,
      inCurrentTopology
    );

    expect(
      validateInstanceAgainstSchema(
        {
          $schema: "",
          size: 150,
        },
        schema
      )
    ).toEqual([
      {
        attribute: "/size",
        reason: "must be <= 100",
      },
    ]);
  });
});

describe("validation of instance compatibility", () => {
  it("should work", async () => {
    expect(
      await validateInstanceCompatibility(
        domain,
        svcTopologyOptimization,
        inCurrentTopology,
        {
          $schema: "#/definitions/NetworkTopology",
          size: 75,
        }
      )
    ).toEqual([]);
  });
});
