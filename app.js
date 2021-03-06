const start = require("./controller/start");
const stop = require("./controller/stop");
const doUpdate = require('./update/update2');
const post = require('./controller/post');
const glob = require('glob');

let hb, shb, conf, restartTimeout;
let moduleData = {};
let moduleFunctions = [];
let additionalModuleFunctions = [];
const intervalHB = 20 * 1000;

const restartHeardBeat = (port, parser) => {
    stop(port, parser).then(res => {
        post(reset = true);
        console.log('restart');
        if(res) heardBeat();
    })
}

// import modules
glob.sync('./{modules,additionalModules}/*/*.js').forEach(path => {
    const file = path.split('/');
    key = file[2];
    key = require(path);
    (!path.includes('additionalModules'))
        ? moduleFunctions.push(key)
        : additionalModuleFunctions.push(key);
});

// get Sensor Data of all modules
const asyncForEach = async (functions, callback) => {
    moduleData = {};
    Object.assign(moduleData, {'date': Date.now()});
    for (let i = 0; i < functions.length; i++) {
        await eval(functions[i])(conf).then(data => {
            Object.assign(moduleData, data);
            if (i === functions.length - 1) {
                callback(moduleData);
            }
        })
    }
}

// heardbeat
const heardBeat = (port, parser) => {
    console.log("START HEARDBEAT");
    asyncForEach(moduleFunctions, uploadData => {
        clearInterval(hb);
        restartTimeout = setTimeout(() => {
            restartHeardBeat(port, parser);
        }, 20000);
        post(port, parser, JSON.stringify(uploadData)).then(response => {
            const { success, file } = JSON.parse(response);
            if (success === 'update') {
                clearTimeout(restartTimeout);
                console.log("clear HB");
                clearInterval(hb);
                doUpdate(port, parser, file).then(result => {
                    if (result === 'extracted') console.log("zip-result", result);
                    // if(additionalModuleFunctions.length > 0) secondHeardbeat(port, parser);
                })
                console.log("success",success);
            }else{
                clearTimeout(restartTimeout);
                hb = setInterval(() => {
                    clearInterval(shb);
                    asyncForEach(moduleFunctions, uploadData => {
                        // clearInterval(hb);
                        restartTimeout = setTimeout(() => {
                            restartHeardBeat(port, parser);
                        }, 20000);
                        post(port, parser, JSON.stringify(uploadData)).then(response => {
                            const { success, file } = JSON.parse(response);
                            if (success === 'update') {
                                clearTimeout(restartTimeout);
                                console.log("clear HB");
                                clearInterval(hb);
                                doUpdate(port, parser, file).then(result => {
                                    if (result === 'extracted') console.log("zip-result", result);
                                    // if(additionalModuleFunctions.length > 0) secondHeardbeat(port, parser);
                                })
                            }else{
                                clearTimeout(restartTimeout);
                                // heardBeat(port, parser);
                                // if(additionalModuleFunctions.length > 0) secondHeardbeat(port, parser);
                            }
                        })
                    });
                }, intervalHB);
                // if(additionalModuleFunctions.length > 0) secondHeardbeat(port, parser);
            }
        })
    }); 
}

// const secondHeardbeat = () => {
//     if(hb){
//         asyncForEach(additionalModuleFunctions, Data => {
//             console.log(Data);
//             secondHeardbeat();
//         });
//     }
// };

(init = () => {
    start().then(_conf => {
        conf = _conf;
        const {port, parser} = conf;
        heardBeat(port, parser);
    });
})();






    // post(port, parser, JSON.stringify(dataForUpload)).then(result => {
    //     if(result === 'success'){
    //         hb = setInterval(() => {
    //             getWeather().then(weather => {
    //                 soilMoisture().then(moisture => {
    //                     getUV().then(uv => {
    //                         dataForUpload = {
    //                             'weather': weather,
    //                             'moisture': moisture,
    //                             'uv': uv
    //                         }
    //                         post(port,parser, JSON.stringify(dataForUpload)).then(result => {
    //                             console.log(result);
    //                         })
    //                     }).catch(err => {
    //                         restartHeardBeat();
    //                     })
    //                 }).catch(err => {
    //                     restartHeardBeat();
    //                 });
    //             }).catch(err => {
    //                 restartHeardBeat();
    //             })
    //         }, 20000)
    //     }
    // })