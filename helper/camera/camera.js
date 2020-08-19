const PiCamera = require('pi-camera'); 
const fs = require('file-system');

let lauf = 1;

const now = new Date();
const month = now.getMonth();
fs.mkdirSync('pictures/'+month, 0777);


const makePic = () => {
  return new Promise((resolve, reject) => {
    const myCamera = new PiCamera({
      mode: 'photo',
      output: `${__dirname}/pictures/${month}/test${lauf}.jpg`,
      width: 1024,
      height: 768,
      nopreview: true,
    });

    myCamera.snap()
      .then((result) => {
        console.log("Pic saved");
        lauf++;
        resolve('success');
      })
      .catch((error) => {
        console.log("Fuck");
        reject(error)
      });
  })
}

module.exports = makePic;