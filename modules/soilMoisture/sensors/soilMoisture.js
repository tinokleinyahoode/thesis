const Raspi = require('raspi');
const I2C = require('raspi-i2c').I2C;
const ADS1x15 = require('raspi-kit-ads1x15');

let moisture;

const getSoilMoisture = () => {
    return new Promise((resolve, reject) => {


        // Init Raspi
        Raspi.init(() => {
            // Init Raspi-I2c
            const i2c = new I2C();

            // Init the ADC
            const adc = new ADS1x15({
                i2c,                                    // i2c interface
                chip: ADS1x15.chips.IC_ADS1115,         // chip model
                address: ADS1x15.address.ADDRESS_0x48,  // i2c address on the bus

                // Defaults for future readings
                pga: ADS1x15.pga.PGA_4_096V,            // power-gain-amplifier range
                sps: ADS1x15.spsADS1115.SPS_250         // data rate (samples per second)
            });

            // Get a single-ended reading from channel-0 and display the results
            adc.readChannel(ADS1x15.channel.CHANNEL_0, (err, value, volts) => {
                if (err) {
                    console.error('Failed to fetch value from ADC', err);
                    process.exit(1);
                } else {
                    value = Math.round(value / 1000);
                    // console.log('Channel 0');
                    // console.log(' * Value:', value);
                    // console.log(' * Volts:', volts);

                    if (value >= 14) {
                        moisture = "trocken"
                    } else if (value <= 14 && value > 10) {
                        moisture = "leicht feucht";
                    } else if (value <= 10 && value > 6) {
                        moisture = "feucht";
                    } else if (value <= 6) {
                        moisture = "nass";
                    }

                    resolve(moisture);
                }
            });

        });
    })
}

module.exports = getSoilMoisture;