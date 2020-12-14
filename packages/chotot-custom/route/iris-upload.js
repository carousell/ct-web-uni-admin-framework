const Request = require('request');
const fs = require('fs');
const { Uploader } = require("ct-iris-client");

const URL_UPLOAD = process.env.IRIS_URL || 'https://gateway.chotot.org/v1/internal/images/upload'
const uploader = new Uploader(URL_UPLOAD);

const FWRequrest = function () {
  // var request = this.request;
  //TODO refactor headers
  // let file_name = `${FOLDER}_${new Date().getTime()}.jpg`;
  UploadIris.call(this);
}

const UploadIris = function () {
  var request = this.request;
  var response = this.response;
  //TODO refactor headers
  let headers = {};
  headers['content-type'] = 'image/jpeg';
  headers['Tenant-Namespace'] = 'chotot';
  var chototUploadImage = Request.post(URL_UPLOAD);
  request.pipe(chototUploadImage);
  chototUploadImage.pipe(response);
  // chototUploadImage.on('response', function (resp) {
  //   console.log('resp', resp.body);
  //   response.writeHead(200, { "Content-Type": "application/json" });
  //   response.end(JSON.stringify(resp.body));
  // }).on('error', function (err) {
  //   console.error('err', err);
  //   response.writeHead(400, { "Content-Type": "application/json" });
  //   response.end(JSON.stringify({ error: err.message }));
  // });
}

Router.route('/iris/image-upload', {where: 'server'}).post(function () {
  var request = this.request;
  var response = this.response;
  let bufs = [];
  request
    .on('data', data => {
      bufs.push(data);
    })
    .on('end', () => {
      var image = Buffer.concat(bufs);
      uploader
        .upload(image, { type: 'admincentre' })
        .then(data => {
          console.log('resp from iris', data);
        })
        .catch(error => {
          console.log('error', error);
        });
      console.log('end');
    });
  // var chototUploadImage = Request.post(URL_UPLOAD);
  // request.pipe(chototUploadImage);
  // chototUploadImage.pipe(response);
  // FWRequrest.call(this);
});