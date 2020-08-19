const fs = require('fs');

let errorCount = 0;
let startCount = 0;
let result;
let test = '';
let lauf = 1;

let FILE_COMMANDS = [
	'AT+HTTPPARA="URL",',
	'AT+HTTPPARA="CID",2',
	'AT+HTTPACTION=0',
	'AT+HTTPREAD=0,'
];

FILE_COMMANDS_RESET = [...FILE_COMMANDS];

const ftp = (port, parser, moduleFile, 
	url = 'http://ttthesis.herokuapp.com/updateModules/') => {
	return new Promise((resolve, reject) => {
		write(port, FILE_COMMANDS[0] + url + moduleFile);

		const parseFTP = data => {
			let response = evaluateFTP(port, data);
			if (response === true) {
				console.log("DOWNLOAD",test);
				startCount = 0;
				FILE_COMMANDS = [...FILE_COMMANDS_RESET];
				parser.removeListener('data', parseFTP);
				const buf = Buffer.from(test);
				console.log("BUF", buf);
				fs.writeFile(`/home/pi/thesis/update/updateFiles/${moduleFile}.zip`, buf, "binary", (err) => {
					if(err) console.log(err);
					resolve(moduleFile);
				});
				
			} else if (response === false) {
				parser.removeListener('data', parseFTP);
			}
		};

		const errorFTP = err => {
			reject(err.data);
			parser.removeListener('error', errorFTP);
		};

		parser.on('data', parseFTP).on('error', errorFTP);
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

const evaluateFTP = (port, data) => {
	console.log(">> ", data);
	if (startCount == 0) {
		currentCommand = FILE_COMMANDS.shift();
		startCount++;
	}

	if(currentCommand == 'AT+HTTPREAD=0,'){
		if(lauf == 3){
			test = data;
			lauf++;
		}else if(lauf == 1 || lauf == 2){
			lauf++;
		}
	}

	const availableResponses = ['ERROR', '+HTTPACTION:', '+HTTPREAD:', 'OK'];
	switch (includesAny(data, availableResponses)) {
		case 'OK':
			if (currentCommand != 'AT+HTTPACTION=0') {
				if (FILE_COMMANDS.length != 0) {
					currentCommand = FILE_COMMANDS.shift();
						write(port, currentCommand);
				} else {
					return true;
				}
			}
			break;
		case '+HTTPACTION:':
			let param = data.split(',').pop();
			currentCommand = FILE_COMMANDS.shift();
			write(port, currentCommand, param);
			break;
		case '+HTTPREAD:':
			break;
		case 'ERROR':
			if (errorCount <= 5) {
				write(port, currentCommand);
				errorCount++;
			} else {
				startCount = 0;
				FILE_COMMANDS = [...FILE_COMMANDS_RESET];
			}
			break;
	}
};

module.exports = ftp;