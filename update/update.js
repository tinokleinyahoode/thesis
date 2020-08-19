const fs = require('fs');
const unzipper = require('unzipper');
const getFile = require('./ftp');

const extractPath = '/home/pi/thesis/modules/';
const updateFilePath = '/home/pi/thesis/update/updateFiles/'

const doUpdate = (port, parser, fileName) => {
    return new Promise((resolve, reject) => {
        getFile(port, parser, fileName).then(file => {
            console.log("unzip", updateFilePath + file);
            fs.createReadStream(updateFilePath+file)
                .pipe(unzipper.Extract({ path: extractPath+file }))
                .promise()
                .then((success, e) => {
                    fs.chmodSync(extractPath + file, 0o777, err => console.log(err));
                    fs.unlink(updateFilePath + file, err => console.log(err));
                    resolve(true);
                   
                    if (e) reject('error', e);
                });

            // fs.createReadStream(updateFilePath + file)
            //     .pipe(unzipper.Extract({ path: updateFilePath + file }))
            //     .promise()
            //     .then((success, e) => {
            //         fs.chmodSync(extractPath + file, 0o777, err => console.log(err));
            //         fs.unlink(updateFilePath + file, err => console.log(err));
            //         resolve(true);
            //         if (e) reject('error', e);
            //     });
        })
    })
}

module.exports = doUpdate;