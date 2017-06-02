var fs = require('fs');
var pug = require('pug');

parsePathForJenkins = function(path, job){
	var start = 'https://jenkins.rfiserve.net/job/' + job + '/ws'
	var startTrim = path.indexOf('/src/style_regression/')
	var newPath = path.substring(startTrim)
	return start + newPath;
};

parseData = function(data, args){
	var jenkins = false;
	console.log(args);
	if(args.length > 0){
		jenkins = true;
		var job = args[0];
	}
	var newData = {};
	newData.testDate = data.testDate;
	delete data.testDate;
	newData.tests = [];

	for(var file in data){
		var fileName = file;
		var casesArray = [];
		for(var cases in data[file]){
			var caseName = cases;
			var tests = [];
			var testPassed = 0;
			var testFailed = 0;
			var testNew = 0;
			for(var test in data[file][cases]){
				var testName = test;
				var ref_shot = data[file][cases][test].ref_path;
				if(jenkins){
					ref_shot = parsePathForJenkins(ref_shot, job);
				}
				var status = data[file][cases][test].status;
				var curTest = {
					test_name:testName,
					status:status,
					ref_shot:ref_shot
				}
				switch(status) {
				    case 'passed':
				    	testPassed++;
				        break;
				    case 'failed':
				    	testFailed++;
				        break;
				    case 'new':
				    	testNew++;
				    default:
				    	console.log('Unknown Status: ' + status);
				}

				if(data[file][cases][test].test_path){
					var test_shot = data[file][cases][test].test_path;
					if(jenkins){
						test_shot = parsePathForJenkins(test_shot, job);
					}
					curTest.test_shot = test_shot;
				};
				if(data[file][cases][test].diff_path){
					var diff_shot = data[file][cases][test].diff_path;
					if(jenkins){
						diff_shot = parsePathForJenkins(diff_shot, job);
					}
					curTest.diff_shot = diff_shot;
				};
				tests.push(curTest);
			}
			var curCase = {
				case_name: caseName,
				tests: tests,
				passed: testPassed,
				failed: testFailed,
				new: testNew
			};
			casesArray.push(curCase);
		}
		var curFile = {
			cases: casesArray,
			file_name:fileName
		};
		newData.tests.push(curFile);
	};
	return newData 
};

var args = process.argv.slice(2);
console.log(args)
console.log(args.length);

var local = false;
var jenkins = false;

if (args.length == 0){
	local = true;
} else {
	jenkins = true;
}

var json = fs.readFileSync(__dirname + '/test/data.json');
json = JSON.parse(json);
json = parseData(json, args);

var compiledFunction = pug.compileFile(__dirname + '/template.pug')

var html = null;
try {
  html = pug.renderFile(__dirname + '/template.pug', {
  	json: json,
  	local: local,
  	jenkins: jenkins
  });
} catch (e) {
	console.log(e)
}

console.log('Saving Report File');
fs.writeFile(__dirname + '/test/' + json.testDate + '/style_regression_report.html', html, function(err) {
	console.log(err);
});
fs.writeFile(__dirname + '/test/style_regression_report.html', html, function(err) {
	console.log(err);
});

writeParsedJsonToFile = function(data){
	var json = JSON.stringify(data);
	try{
	fs.writeFileSync(__dirname + '/test/' + data.testDate + '/parsed_data.json', json);
	} catch(err){
	console.log(err);
	};
};

writeParsedJsonToFile(json);