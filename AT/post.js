
let errorCount = 0;
let startCount = 0;
let result;

let POST_COMMANDS = [
	'AT+HTTPPARA="URL",',
	'AT+HTTPPARA="CID",1',
	'AT+HTTPPARA="CONTENT","application/json"',
	'AT+HTTPDATA=',
	'AT+HTTPACTION=1',
	'AT+HTTPREAD=0,'
];

POST_COMMANDS_RESET = [...POST_COMMANDS];

const post = (port, parser, sensorData, url = 'http://ttthesis.herokuapp.com/pillar', reset = false) => {
	return new Promise((resolve, reject) => {

		if(reset === true){
			POST_COMMANDS = [...POST_COMMANDS_RESET];
			startCount = 0;
			errorCount = 0;
			resolve(true);
		} 

		write(port, POST_COMMANDS[0] + url);

		const parsePost = data => {
			let response = evaluatePost(port, data, sensorData);
			if (response === true) {
				console.log(result);
				startCount = 0;
				POST_COMMANDS = [...POST_COMMANDS_RESET];
				parser.removeListener('data', parsePost);
				resolve(result);
			} else if (response === false) {
				parser.removeListener('data', parsePost);
			}
		};

		const errorPost = err => {
			reject(err.data);
			parser.removeListener('error', errorPost);
		};

		parser.on('data', parsePost).on('error', errorPost);
	});
};

const includesAny = (string, arr) => {
	let match;
	arr.map(i => {
		if (string.includes(i)) match = i;
	});
	return match;
};

const write = (port, cmd, params = '') => {
	console.log("<< ", cmd);
	port.write(cmd + params + '\r\n');
	params = '';
};

const evaluatePost = (port, data, sensorData) => {
	console.log(">> ", data);
	if (startCount == 0) {
		currentCommand = POST_COMMANDS.shift();
		startCount++;
	}

	const availableResponses = ['ERROR', '+HTTPACTION:', 'DOWNLOAD', 'success', 'update', 'OK'];
	switch (includesAny(data, availableResponses)) {
		case 'OK':
			if (currentCommand != 'AT+HTTPACTION=1') {
				if (POST_COMMANDS.length != 0) {
					currentCommand = POST_COMMANDS.shift();
					if (currentCommand === 'AT+HTTPDATA=') {
						let byteLength = Buffer.byteLength(sensorData, 'utf8');
						let param = byteLength + ",10000";
						write(port, currentCommand, param);
					} else {
						write(port, currentCommand);
					}
				} else {
					return true;
				}
			}
			break;
		case 'DOWNLOAD':
			write(port, sensorData);
			break;
		case '+HTTPACTION:':
			let param = data.split(',').pop();
			currentCommand = POST_COMMANDS.shift();
			write(port, currentCommand, param);
			break;
		case 'success': 
		case 'update':
			result = data;
			break;
		case 'ERROR':
			if (errorCount <= 5) {
				write(port, currentCommand);
				errorCount++;
			} else {
				startCount = 0;
				POST_COMMANDS = [...POST_COMMANDS_RESET];
				errorCount = 0;
			}
			break;
	}
};

module.exports = post;