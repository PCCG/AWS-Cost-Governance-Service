const fs = require('fs');
const { Worker, isMainThread, workerData } = require('worker_threads');

function processReport () {
  if (isMainThread) {
    //This file houses code that the main thread is supposed to handle. At the same time it houses
    //code that thw worker thread is supposed to handle
    const reportProcessor = new Worker(__filename);
    reportProcessor.once('message',  (processedData) => {
      // Do something with the processed/parsed data.
    })
  } else {
    // Code to be handled by the worker should be written within this block. Trying to parse the report outside of this block
    // might end up blocking the event loop.
  }
}
