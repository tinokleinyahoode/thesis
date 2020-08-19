const BME280 = require('bme280-sensor');

const options = {
  i2cAddress: 0x76
};

const getWeather = () => {
  return new Promise((resolve, reject) => {

    const bme280 = new BME280(options);

    const readSensorData = () => {
      bme280.readSensorData()
        .then((data) => {
          for(let key in data){
            data[key] = data[key].toFixed(2);
            if(key.includes('_')){
              data[key.split('_')[0]] = data[key];
              delete data[key];
            }
          }
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    };

    // Initialize the BME280 sensor
    //
    bme280.init()
      .then(() => {
        readSensorData();
      })
      .catch((err) => reject(err));

  });

}

module.exports = getWeather;