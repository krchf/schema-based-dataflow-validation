import { domain } from "../src/example-domain";
import { writeFileSync } from "fs";

writeFileSync("demo/domain.json", JSON.stringify(domain, null, 2));
writeFileSync(
  "demo/metadata.json",
  JSON.stringify(
    {
      $schema: "#/definitions/NetworkTopology",
      size: 50,
    },
    null,
    2
  )
);
