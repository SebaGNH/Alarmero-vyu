// R > src/workers/timerWorker.ts
let intervalId: number | undefined;

self.onmessage = (e: MessageEvent<string>) => {
  if (e.data === "start") {
    if (intervalId !== undefined) return;
    intervalId = self.setInterval(() => {
      self.postMessage(Date.now());
    }, 1000);
  } else if (e.data === "stop") {
    if (intervalId !== undefined) {
      self.clearInterval(intervalId);
      intervalId = undefined;
    }
  }
};

export {};
