const fs = require('fs');
const zlib = require('zlib');
const { Worker, isMainThread, workerData, parentPort } = require('worker_threads');
const convertBufferToStream = require('../../../utils/bufferToStream');
const { parse } = require('@fast-csv/parse');
const AwsCurProcessedData = require('../../../models/collection/aws/processed-data');

if (!isMainThread) {
    // Code to be handled by the worker should be written within this block. Trying to parse the report outside of this block
    // might end up blocking the event loop.
    let cost_reports = [];
    let total_number_of_records = 0;
    const cuReportOctetStreams = workerData;
    cuReportOctetStreams.forEach(cuReportOctetStream => {
      const cost_report = {};
      const reportStream = convertBufferToStream(cuReportOctetStream);
      reportStream
      .pipe(zlib.createUnzip())
      .pipe(parse({ headers: true }))
      .on('data', report_record => {
        // Blended costs are associated with organizations that host multiple AWS accounts.
        // Organizations consist of master accounts and member accounts. It's generally recommended
        // to enable consolidated billing in the master account to gather costs incurred by member accounts.
        // Unblended costs are to be monitored for individual accounts.
        const unblended_cost = parseFloat(report_record['lineItem/UnblendedCost']);
        const blended_cost = parseFloat(report_record['lineItem/BlendedCost']);
        if(unblended_cost || blended_cost) {
          const aws_service = report_record['product/ProductName'];
          const pricing_currency = report_record['pricing/currency'];
          const billing_period_start_date = report_record['bill/BillingPeriodStartDate'];
          const billing_period_end_date = report_record['bill/BillingPeriodEndDate'];
          const region = report_record['product/region'];
          const account_id = report_record['lineItem/UsageAccountId'];
          const billing_period = `${new Date(billing_period_start_date).toLocaleDateString()}-${new Date(billing_period_end_date).toLocaleDateString()}`;
          cost_report[billing_period] = cost_report[billing_period] ? cost_report[billing_period] : {};
          cost_report[billing_period].pricing_currency = pricing_currency;
          // Store data by service
          cost_report[billing_period].service = cost_report[billing_period].service ? cost_report[billing_period].service : {};
          cost_report[billing_period].service[aws_service] = cost_report[billing_period].service[aws_service] ? cost_report[billing_period].service[aws_service] : {};
          cost_report[billing_period].service[aws_service].blended_cost = cost_report[billing_period].service[aws_service].blended_cost ? cost_report[billing_period].service[aws_service].blended_cost += blended_cost : blended_cost;
          cost_report[billing_period].service[aws_service].unblended_cost = cost_report[billing_period].service[aws_service].unblended_cost ? cost_report[billing_period].service[aws_service].unblended_cost += unblended_cost : unblended_cost;
          // Store data by region
          if(region !== '') {
            cost_report[billing_period].region = cost_report[billing_period].region ? cost_report[billing_period].region : {};
            cost_report[billing_period].region[region] = cost_report[billing_period].region[region] ? cost_report[billing_period].region[region] : {};
            cost_report[billing_period].region[region].blended_cost = cost_report[billing_period].region[region].blended_cost ? cost_report[billing_period].region[region].blended_cost += blended_cost : blended_cost;
            cost_report[billing_period].region[region].unblended_cost = cost_report[billing_period].region[region].unblended_cost ? cost_report[billing_period].region[region].unblended_cost += unblended_cost : unblended_cost;
          }
          // Store data by account
          cost_report[billing_period].account = cost_report[billing_period].account ? cost_report[billing_period].account : {};
          cost_report[billing_period].account[account_id] = cost_report[billing_period].account[account_id] ? cost_report[billing_period].account[account_id] : {};
          cost_report[billing_period].account[account_id].blended_cost = cost_report[billing_period].account[account_id].blended_cost ? cost_report[billing_period].account[account_id].blended_cost += blended_cost : blended_cost;
          cost_report[billing_period].account[account_id].unblended_cost = cost_report[billing_period].account[account_id].unblended_cost ? cost_report[billing_period].account[account_id].unblended_cost += unblended_cost : unblended_cost;
        }
      })
      .on('end', number_of_records => {
        cost_reports.push(cost_report);
        total_number_of_records += number_of_records;
        if (cost_reports.length === cuReportOctetStreams.length) {
            cost_reports = cost_reports.sort((cost_report_1, cost_report_2) => {
                return new Date(Object.keys(cost_report_1)[0].split('-')[0]) - new Date(Object.keys(cost_report_2)[0].split('-')[0]);
            });   
            parentPort.postMessage({total_number_of_records, cost_reports});
        }
      });
    });
  }
  
  function processReport (cuReportOctetStreams, collectionStatus) {
    //This file houses code that the main thread is supposed to handle. At the same time it houses
    //code that the worker thread is supposed to handle
    const reportProcessor = new Worker(__filename, {
      workerData: cuReportOctetStreams
    });
    reportProcessor.on('message', async processedData => {
      collectionStatus.number_of_records = processedData.total_number_of_records;
      collectionStatus.save();
      const processedDataExistsForAccount = await AwsCurProcessedData.exists({accountId: collectionStatus.accountId});
      if (processedDataExistsForAccount) {
        const processedDataForAccount = await AwsCurProcessedData.findOne({accountId: collectionStatus.accountId});
        processedDataForAccount.costReport = processedData.cost_reports;
        processedDataForAccount.save();
      } else {
        const awsCurProcessedData = new AwsCurProcessedData();
        awsCurProcessedData.accountId = collectionStatus.accountId;
        awsCurProcessedData.costReport = processedData.cost_reports;
        awsCurProcessedData.save();
      }
    });
  }

  module.exports = processReport;