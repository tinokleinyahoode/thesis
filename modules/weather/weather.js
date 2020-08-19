const getWeather = require('./sensors/weather');
const getUV = require('./sensors/uv');

const weather = () => {
    return new Promise((resolve, reject) => {
        getWeather().then(weather => {
            getUV().then(uv => {
                const weatherObj = {
                    'weather': weather,
                    'uv': uv
                }
                resolve(weatherObj);
            })
        })
    })
}

module.exports = weather;