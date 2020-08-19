 const getMotion = (input) => {
  return new Promise((resolve, reject) => {
      resolve(input.read());
  })
}

module.exports = getMotion;