module.exports = function (curObject) {
  this.bucketName = curObject.S3Bucket;
  this.reportName = curObject.ReportName;
  this.prefix = curObject.S3Prefix;
  this.region = curObject.S3Region;
  this.getBucketName = function () {
    return this.bucketName;
  };
  this.getRegion = function () {
    return this.region;
  };
  this.getPrefix = function () {
    return this.prefix;
  };
  this.getReportName = function () {
    return this.reportName;
  }
}
