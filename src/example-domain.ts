import { Domain } from "./types";

export const svcDemandForecast = "DemandForecast";
export const inTechnologyForecast = "technologyForecast";
export const inCurrentDemands = "currentDemands";
export const inNetworkTopology = "networkTopology";
export const outDemandForecast = "demandForecast";

export const svcTopologyOptimization = "TopologyOptimization";
export const inDemandForecast = "demandForecast";
export const inCurrentTopology = "currentTopology";
export const outOptimizedTopology = "optimizedTopology";

export const domain: Domain = {
  $schema: "http://json-schema.org/draft-07/schema",
  definitions: {
    Resolution: { enum: ["Yearly", "Daily", "Hourly"] },
    Technology: { enum: ["BEV", "Wallbox", "PV"] },
    TechnologyForecast: {
      properties: {
        resolution: { $ref: "#/definitions/Resolution" },
        technologies: {
          items: { $ref: "#/definitions/Technology" },
        },
      },
    },
    DemandForecast: {
      properties: {
        resolution: { $ref: "#/definitions/Resolution" },
      },
    },
    NetworkTopology: {
      properties: {
        size: { type: "number" },
      },
    },
  },
  type: "object",
  properties: {
    /* = service interfaces */
    DemandForecast: {
      properties: {
        inputs: {
          properties: {
            technologyForecast: {
              allOf: [
                { $ref: "#/definitions/TechnologyForecast" },
                {
                  type: "object",
                  properties: {
                    resolution: {
                      const: "Yearly",
                    },
                  },
                },
              ],
            },
          },
        },
        outputs: {
          properties: {
            demandForecast: {
              allOf: [
                { $ref: "#/definitions/DemandForecast" },
                {
                  type: "object",
                  properties: {
                    resolution: {
                      $ref: "#/properties/DemandForecast/properties/inputs/properties/technologyForecast/allOf/1/properties/resolution",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    TopologyOptimization: {
      properties: {
        inputs: {
          properties: {
            /* = data constraints */
            demandForecast: {
              allOf: [
                /* The input is a DemandForecast (R1) */
                { $ref: "#/definitions/DemandForecast" },
                {
                  properties: {
                    /* Resolution must be yearly (R3) */
                    resolution: { const: "Yearly" },
                  },
                },
              ],
            },
            currentTopology: {
              allOf: [
                { $ref: "#/definitions/NetworkTopology" },
                /* Network size must be below 100 (R3) */
                { properties: { size: { maximum: 100 } } },
              ],
            },
          },
        },
        outputs: {
          properties: {
            optimizedTopology: {
              allOf: [
                { $ref: "#/definitions/NetworkTopology" },
                {
                  properties: {
                    /* Optimized size is 50% of current size (R4) */
                    // size: { $ref: "...", scale: 0.5 },
                    /* Network is redundant in transformers (R3) */
                    redundancy: { const: "Transformers" },
                  },
                },
              ],
            },
          },
        },
      },
    },
  } /* other services abbreviated */,
};
