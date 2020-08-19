const fs = require('fs');

let errorCount = 0;
let startCount = 0;
let result, size;
let test = '';
let lauf = 1;

let FTP_COMMANDS = [
	'AT+SAPBR=3,2,"Contype","GPRS"',
	'AT+SAPBR=3,2,"APN","web.vodafone.de"',
    'AT+SAPBR=1,2',
	'AT+SAPBR=2,2',
	'AT+FTPCID=2',
	'AT+FTPTYPE="I"',
    'AT+FTPPORT=21',
    'AT+FTPMODE=1',
    'AT+FTPSERV="82.165.203.58"',
    'AT+FTPUN="saeule"',
    'AT+FTPPW="0M9n8B7v$"',
    'AT+FTPGETPATH="/moduleFiles/"',
    'AT+FTPGETNAME=',
	'AT+FTPSIZE',
    'AT+FTPGET=1',
    'AT+FTPGET=2,',
    'AT+FTPQUIT'
]

let FTP_COMMANDS_RESET = [...FTP_COMMANDS];

const getFile = (port, parser, moduleFile) => {
    return new Promise((resolve, reject) => {
		write(port, FTP_COMMANDS[0]);

		const parseFTP = data => {
			let response = evaluateFTP(port, data, moduleFile);
			if (response === true) {
				startCount = 0;
				FTP_COMMANDS = [...FTP_COMMANDS_RESET];
				parser.removeListener('data', parseFTP);
				fs.writeFile(`/home/pi/thesis/update/updateFiles/${moduleFile}`, result, (err) => {
					if (err) console.log(err);
					fs.chmodSync(`/home/pi/thesis/update/updateFiles/${moduleFile}`, 0o777, err => console.log(err));
                    // fs.unlink(updateFilePath+file, err => console.log(err));
					// fs.rename('./'+moduleFile, './updateFiles/'+moduleFile, () => {
						resolve(moduleFile);
					// })
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
}

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

const evaluateFTP = (port, data, moduleFile) => {
	console.log(">> ", data);
	if (startCount == 0) {
		currentCommand = FTP_COMMANDS.shift();
		startCount++;
	}

	if(currentCommand == 'AT+FTPGET=2,'){
		if(lauf == 3){
			test = data;
			lauf++;
		}else if(lauf == 1 || lauf == 2){
			lauf++;
		}
	}

	const availableResponses = ['ERROR', 'OK', '+FTPSIZE:', '+FTPGET:'];
	switch (includesAny(data, availableResponses)) {
		case 'OK':
			console.log(lauf);
            if(currentCommand != 'AT+FTPSIZE' && currentCommand != 'AT+FTPGET=1' && currentCommand != 'AT+FTPGET=2,'){

				if (FTP_COMMANDS.length != 0) {
                    currentCommand = FTP_COMMANDS.shift();
                    if(currentCommand == 'AT+FTPGETNAME='){
                        param = `${moduleFile}`;
                        write(port, currentCommand, param);
					}else{
                        write(port, currentCommand);
                    }
				} 
				// else {
				// 	return true;
                // }
            }else if(currentCommand == 'AT+FTPGET=2,' && lauf == 4){
				result = test;
				return true;
			}
			
            break;
        case '+FTPSIZE:':
            size = data.split(',').pop();
            currentCommand = FTP_COMMANDS.shift();
			write(port, currentCommand);
			break;  
		case '+FTPGET:':
			let findGet = data.split(':').pop();
			// console.log("findGet",findGet);
			if(findGet.includes('1,')){
				currentCommand = FTP_COMMANDS.shift();
				write(port, currentCommand, size);
			}
			break;		
		case 'ERROR':
			if (errorCount <= 5) {
				write(port, currentCommand);
				errorCount++;
			} else {
				startCount = 0;
				FTP_COMMANDS = [...FTP_COMMANDS_RESET];
			}
			break;
	}
};

module.exports = getFile;