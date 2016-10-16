'use strict';

var fs = require('fs');

prepareData('patients.db', () => {
	var patients = require('./patients.json');

	let duplicateList = findDuplicates(patients);

	console.log('List of duplicates:');
	console.log(duplicateList);

	deleteDuplicates(patients, duplicateList);

	let newDuplicateList = findDuplicates(patients);

	console.log('New list of duplicates:');
	console.log(newDuplicateList);

	patients = upgradeDataStructure(patients, 'Y4elds6pBo2nOfop');
	storeToFile(patients);
});

function prepareData(filename, callback) {
	fs.readFile(filename, 'utf8', function (err, data) {
	 	if (err) {
	    	return console.error(err);
	  	}

	  	data = data.replace(/\n/g, ',\n');
	  	data = data.substring(0, data.length - 2);
	  	data = '[' + data + ']';

	  	// console.log('[' + data + ']');

	  	fs.writeFile("./patients.json", data, function(err) {
	    	if(err) {
	        	return console.error(err);
	    	}

    		console.log("The file was prepared.");
    		callback();
		}); 
	});
}

function findDuplicates(patients) {
	let duplicateArray = [];

	patients.forEach((patient, patientIndex) => {
		let tempArray = [];
		patient.treatments.forEach((treatment, treatmentIndex) => {
			if (tempArray.indexOf(treatment.id) > -1) {
				duplicateArray.push({
					patientIndex: patientIndex,
					treatmentIndex: treatmentIndex
				});
			}
			tempArray.push(treatment.id);
		});
	});

	return duplicateArray;
}

function deleteDuplicates(patients, duplicateArray) {
	duplicateArray.forEach(duplicate => {
		patients[duplicate.patientIndex].treatments.splice([duplicate.treatmentIndex], 1);
	});
}

function upgradeDataStructure(patients, userId) {
	return patients.map(patient => {
		if (patient.hasOwnProperty('last_invoiced')) {
			let lastInvoicedDate = patient.last_invoiced;
			patient.last_invoiced = {};
			patient.last_invoiced[userId] = lastInvoicedDate;
		}
		return patient;
	});
}

function storeToFile(patients) {
	let patientsStringArray = patients.map(patient => JSON.stringify(patient))
	let patientsString = patientsStringArray.join('\n');

	let content = '[' + patientsString + ']';

	fs.writeFile("./newPatients.json", content, function(err) {
	    if(err) {
	        return console.error(err);
	    }

    	console.log("The file was saved!");
	}); 
}
