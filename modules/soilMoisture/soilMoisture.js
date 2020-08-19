const getSoilMoisture = require('./sensors/soilMoisture');

const soilMoisture = () => {
    return new Promise((resolve, reject) => {
        getSoilMoisture().then(moisture => {
            const moistureObj = {
                'moisture': moisture
            }
            resolve(moistureObj);
        })
    })
}

module.exports = soilMoisture;