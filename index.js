var fs = require('fs');
var gm = require('gm');
var aws = require('aws-sdk');
var s3 = new aws.S3({apiVersion: '2006-03-01'});

exports.handler = function(event, context) {

  var bucket = event.Records[0].s3.bucket.name;
  var key = event.Records[0].s3.object.key;

  s3.getObject({
    Bucket: bucket,
    Key: key
  }, function(err, data) {
    if (err) {
        context.done('get failed', err);
    } else {
      var contentType = data.ContentType;
      var extension = contentType.split('/').pop();
      gm(data.Body)
        .options({ imageMagick: true })
        .resize(480, 269)
        .fill("#81BD27")
        .drawText(200, 250, 'LGTM')
        .font('/usr/share/fonts/dejavu/DejaVuSans.ttf')
	.fontSize(40)
        .toBuffer(extension, function(err, stdout) {
          if (err) {
              context.done('resize and drawtext failed', err);
          } else {
            s3.putObject({
              Bucket: 'lambda-image-lgtm',
              Key: key,
              Body: new Buffer(stdout, 'binary'),
              ContentType: contentType
            }, function(err, res) {
              if (err) {
                context.done('put failed', err);
              } else {
                context.done();
              }
            });
          }
        });
    }
  });

};
