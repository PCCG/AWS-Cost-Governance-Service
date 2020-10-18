const fs = require('fs');
const zlib = require('zlib');
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const convertBufferToStream = require('../../../utils/bufferToStream');
const { parse } = require('@fast-csv/parse');


if (!isMainThread) {
  // Code to be handled by the worker should be written within this block. Trying to parse the report outside of this block
  // might end up blocking the event loop.
  const cuReportOctetStream = workerData;
  const reportStream = convertBufferToStream(cuReportOctetStream);
  reportStream
  .pipe(zlib.createUnzip())
  .pipe(parse({ headers: true }))
  .on('data', report_record => {
    const unblended_cost = report_record['lineItem/UnblendedCost'];
    const blended_cost = report_record['lineItem/BlendedCost'];
    if(parseFloat(unblended_cost) || parseFloat(blended_cost)) {
      
    }
  })
  .on('end', number_of_records => {
    parentPort.postMessage(number_of_records);
  });
}

function processReport (cuReportOctetStream, collectionStatus) {
  //This file houses code that the main thread is supposed to handle. At the same time it houses
  //code that the worker thread is supposed to handle
  const reportProcessor = new Worker(__filename, {
    workerData: cuReportOctetStream
  });
  reportProcessor.on('message', number_of_records => {
    collectionStatus.number_of_records = number_of_records;
    collectionStatus.save();
  });
}

module.exports = processReport;
