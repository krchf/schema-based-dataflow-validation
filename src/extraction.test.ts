import {
  domain,
  inCurrentTopology,
  svcTopologyOptimization,
} from "./example-domain";
import {
  extractInputMetadataSchema,
  extractMetadataSchema,
} from "./extraction";

describe("extractMetadataSchema", () => {
  it("should work for input", async () => {
    expect(
      await extractInputMetadataSchema(
        domain,
        svcTopologyOptimization,
        inCurrentTopology
      )
    ).toEqual({
      definitions: domain.definitions,
      allOf: [
        { $ref: "#/definitions/NetworkTopology" },
        /* Network size must be below 100 (R3) */
        { properties: { size: { maximum: 100 } } },
      ],
    });
  });
});
