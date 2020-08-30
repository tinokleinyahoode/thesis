let errorCount = 0;
let startCount = 0;

let STOP_COMMANDS = [
    'AT+SAPBR=0,1', 
    'AT+SAPBR=0,2',
    'AT+HTTPTERM'];
let STOP_COMMANDS_RESET = [...STOP_COMMANDS];

const stop = (port, parser) => {
    port = port;
	return new Promise((resolve, reject) => {

		write(port, STOP_COMMANDS[0]);
		
		const parseStop = data => {
			let response = evaluateStop(port, data);
			if (response === true) {
                resolve(response);
                startCount = 0;
                STOP_COMMANDS = [...STOP_COMMANDS_RESET];
				parser.removeListener('data', parseStop);
			}else if(response === false){
                reject(false);
            }
		};

		const errorStop = err => {
			reject(err.data);
			parser.removeListener('error', errorStop);
		};

		parser.on('data', parseStop).on('error', errorStop);
	});
};

const includesAny = (string, arr) => {
	let match;
	arr.map(i => {
		if (string.includes(i)) match = i;
	});
	return match;
};

const write = (port, cmd) => {
	port.write(cmd + '\r\n');
};

const evaluateStop = (port, data) => {

    if (startCount == 0) {
		currentCommand = STOP_COMMANDS.shift();
		startCount++;
    }
    
    let availableResponses = ['OK', 'ERROR'];
	switch (includesAny(data, availableResponses)) {
        case 'OK':
            if (STOP_COMMANDS.length != 0) {
                currentCommand = STOP_COMMANDS.shift();
                write(port, currentCommand);
            } else {
                return true;
            }
            break;
        case 'ERROR':
            if (errorCount <= 5) {
                write(port, currentCommand);
                errorCount++;
            }else{ 
                errorCount = 0;
                if (STOP_COMMANDS.length != 0) {
                    currentCommand = STOP_COMMANDS.shift();
                    write(port, currentCommand);
                }else{
                    return true;
                }
            }    
    }
}

module.exports = stop;