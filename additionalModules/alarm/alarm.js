const getMotion = require('./sensors/motion');
const buzz = require('./actors/buzzer');
const makePic = require('../../helper/camera/camera');
const post = require('../../controller/post');

const alarm = (conf) => {
    const {input, output, gpio} = conf;

    return new Promise((resolve, reject) => {
        getMotion(input).then(motion => {
            console.log("motion: ", motion);
            if(motion === 1){
                buzz(gpio, output, 5000).then(res => {
                    // makePic();
                    if(res){
                        resolve({'motion': motion});
                    }
                });
            }else{
                resolve({'motion': motion});
            }
        })
    })
}

module.exports = alarm;