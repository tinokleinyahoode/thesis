const { readdirSync, statSync } = require('fs')
const { join } = require('path');


const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)).isDirectory());
let folders = dirs('/home/pi/thesis/modules/');

// folders.forEach((folder) => {
//     folder = require(`../modules/${folder}/${folder}`);

// })

const getModules = () => {
    return new Promise((res, rej) => {
        // for(let i = 0; i < folders.length; i++){
        //     let test = this.folders[i];
        //    const  = require(`../modules/${folders}/${folders[i]}`);
        // }
        // const weather = require('../modules/weather/weather');
        // const soilMoisture = require('../modules/soilMoisture/soilMoisture');
        res(folders);
    })
}

module.exports = getModules;