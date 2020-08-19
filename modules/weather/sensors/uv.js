const raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;

const i2cAdd = 0x38;

const getUV = () => {
  return new Promise((resolve, reject) => {
    raspi.init(() => {
      const i2c = new I2C();
        const uvIndex = i2c.readByteSync(i2cAdd);
        resolve(uvIndex);
    });
  });
}
 
module.exports = getUV;