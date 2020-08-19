const buzz = (gpio, output, buzzTime = 10000) => {
    return new Promise((resolve, reject) => {
        output.write(gpio.HIGH);
        setTimeout(() => {
            output.write(gpio.LOW);
            resolve(true);
        }, buzzTime)
    })
    
}

module.exports = buzz;