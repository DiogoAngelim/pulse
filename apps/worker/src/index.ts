import { createSeedRuntime } from "@pulse/runtime";
import { PulseWorker } from "./worker.js";

const runtime = await createSeedRuntime();
const worker = new PulseWorker(runtime);

await worker.runOnce();
console.log("Pulse worker completed");
