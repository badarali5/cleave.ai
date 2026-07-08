import { createWorkerRuntime } from "./queue/worker-runtime.js";

const runtime = createWorkerRuntime();
const firstRun = await runtime.runNext();
const secondRun = await runtime.runNext();

console.log(
  JSON.stringify(
    {
      service: "worker",
      queue: runtime.queue.list(),
      runs: [firstRun, secondRun],
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);
