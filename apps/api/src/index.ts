import { createDefaultRuntime } from "./bootstrap.js";
import { createPulseApiServer } from "./server.js";

const port = Number(process.env.PORT ?? 3000);
const runtime = await createDefaultRuntime();
const server = createPulseApiServer(runtime);

server.listen(port, () => {
  console.log(`Pulse API listening on ${port}`);
});

