const fs = require('fs');
// const unzipper = require('unzipper');
const AdmZip = require('adm-zip');
const ftp = require('./ftp2');

const extractPath = '/home/pi/thesis/modules/';
const updateFilePath = '/home/pi/thesis/update/updateFiles/'

const doUpdate = (port, parser, fileName) => {
    return new Promise((resolve, reject) => {
        ftp(port, parser, fileName).then(file => {
            const zipFile = `${file}.zip`;
            console.log("unzip", updateFilePath + zipFile);
            let zip = new AdmZip(`${updateFilePath}${file}.zip`);
            zip.writeZip(`${extractPath}${file}.zip`);
            // fs.createReadStream(updateFilePath+zipFile)
            //     .pipe(unzipper.Extract({ path: extractPath }))
            //     .promise()
            //     .then((success, e) => {
            //         fs.chmodSync(extractPath, 0o777, err => console.log(err));
            //         fs.unlink(updateFilePath, err => console.log(err));
            //         resolve(true);
                   
            //         if (e) reject('error', e);
            //     });
        })
    })
}

module.exports = doUpdate;