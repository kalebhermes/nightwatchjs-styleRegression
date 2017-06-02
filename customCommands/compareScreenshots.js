var util = require('util');
var events = require('events');
var fs = require('fs');
var resemble = require('node-resemble-js');

/*
 * This custom command allows us to locate an HTML element on the page and then wait until the element is both visible
 * and has a "disabled" state.  It clicks and then checkes the element state until either it evaluates to true.
 */

function CompareScreeshots() {
  events.EventEmitter.call(this);
}

util.inherits(CompareScreeshots, events.EventEmitter);

CompareScreeshots.prototype.command = function (name, callback) {
  var self = this;
  var name = this.cleanName(name);

  self.initGlobal();
  self.initGlobalModule(); 
  if(self.trackCurrentShot(name) === true){
    self.api.perform(function(){
      var message = "Compare Screenshots: A screenshot has already been taken for " + name + " this session. This shot will be skipped.";
      self.client.assertion(true, true, true, message, true);
      self.emit('complete');
    });
  } else {

    var testFilePath = this.buildTestFilePath(name);
    var refFilePath = this.buildRefFilePath(name);

    try {
      var image = fs.readFileSync(refFilePath);
    } catch (err) {
      console.log(err);
      if (err.code === 'ENOENT') {
        this.api.saveScreenshot(refFilePath, function(screenshot){
          self.markTestNew(name, refFilePath);
          if(callback){
            callback(screenshot);
          };
          self.writeJSON();
          self.client.assertion(true, screenshot, screenshot, "Compare Screenshots: New reference screenshot taken.", true);
          self.emit('complete');
        });
      } else {
        if(callback){
          callback('There was an error: ' + err);
        }
        throw err;
      }
    }

    if(image){
      this.api.saveScreenshot(testFilePath, function(screenshot){
        self.compareShots(name, screenshot, image, testFilePath, refFilePath, function (result) {
          self.writeJSON();
          if(result.passed){
            self.client.assertion(true, result.message, result.message, "Compare Screenshots:" + result.message, true);
          } else if (!result.passed){
            self.client.assertion(true, result.passMessage, result.failureMessage, "Compare Screenshots: " + result.failureMessage, true);
          } else{
            console.log('I don\'t know what happened.')
          }
          self.emit('complete');
        });
      });
    }

    return this;
  }
};

CompareScreeshots.prototype.compareShots = function (name, screenshot, image, testFilePath, refFilePath, callback) {
  var self = this;

  var screenshot = new Buffer(screenshot.value, 'base64');

  resemble(image)
    .compareTo(screenshot)
    .onComplete(function(data){
      if (Number(data.misMatchPercentage) <= 0.01) {
        self.markTestPassed(name, testFilePath, refFilePath);
        if(callback){
          var result = {
            passed: true,
            message: name + ' compairson passed!'
          };
          callback(result);
        }
      } else {
        var diffFilePath = testFilePath + '_diff.png';
        data.getDiffImage().pack().pipe(fs.createWriteStream(diffFilePath));
        self.markTestFailed(name, testFilePath, refFilePath, diffFilePath);
        if(callback){
          var result = {
            passed: false,
            failureMessage: name + " screenshots differ " + data.misMatchPercentage + "%",
            passMessage: name + " compairson passed!"
          };
          callback(result);
        }
      }
      return this;
  });
};

CompareScreeshots.prototype.buildTestFilePath = function(name) {
  var self = this;
  var subTestName = this.stripTestName();
  var fileName = global.currentStatus.testDate + '/' + self.api.currentTest.module + '/' + subTestName + '/' + name + '.png';

  return __base + 'style_regression/test/' + fileName;
};

CompareScreeshots.prototype.buildRefFilePath = function(name) {
  var self = this;
  var subTestName = this.stripTestName();
  var fileName = self.api.currentTest.module + '/' + subTestName + '/' + name + '.png';

  return __base + 'style_regression/refs/' + fileName;
};

CompareScreeshots.prototype.stripTestName = function(){
  return this.api.currentTest.name.substr((this.api.currentTest.name.indexOf(': ') + 2), 5);
};

CompareScreeshots.prototype.cleanName = function(name){
  return name.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
};

CompareScreeshots.prototype.markTestPassed = function(name, testFilePath, refFilePath){
  var self = this;
  var module = self.api.currentTest.module;
  var testName = self.stripTestName(self.api.currentTest.name);

  var temp = {
    ref_path: refFilePath,
    test_path: testFilePath,
    status: 'passed'
  };

  global.currentStatus[module][testName][name] = temp;
};

CompareScreeshots.prototype.markTestFailed = function(name, testFilePath, refFilePath, diffFilePath){
  var self = this;
  var module = self.api.currentTest.module;
  var testName = self.stripTestName(self.api.currentTest.name);

  var temp = {
    ref_path: refFilePath,
    test_path: testFilePath,
    diff_path: diffFilePath,
    status: 'failed'
  };

  global.currentStatus[module][testName][name] = temp;
};

CompareScreeshots.prototype.markTestNew = function(name, refFilePath){
  var self = this;
  var module = self.api.currentTest.module;
  var testName = self.stripTestName(self.api.currentTest.name);

  var temp = {
    ref_path: refFilePath,
    status: 'new'
  };

  global.currentStatus[module][testName][name] = temp;
};

CompareScreeshots.prototype.initGlobal = function(){
  var date = new Date();
  newDate = date.getMonth()+1 + '.' + date.getDate() + '.' + date.getFullYear() + '_' + date.getHours() + '.' + date.getMinutes();

  if(!global.currentStatus){
    global.currentStatus = {};
    global.currentStatus.testDate = newDate;
    global.shotList = {};
  };
};

CompareScreeshots.prototype.initGlobalModule = function(){
  var self = this;
  var module = self.api.currentTest.module;
  var testName = self.stripTestName(self.api.currentTest.name);

  if(!global.currentStatus[module]){
    global.currentStatus[module] = {};
  };
  if(global.currentStatus[module] && !global.currentStatus[module][testName]){
      global.currentStatus[module][testName] = {};
  };
};

CompareScreeshots.prototype.trackCurrentShot = function(name){
  var self = this;

  if(global.shotList[name]){
    return true;
  } else {
    global.shotList[name] = true;
    return false;
  };
};

CompareScreeshots.prototype.writeJSON = function(){
  var self = this;

  var json = JSON.stringify(global.currentStatus);
  try{
    fs.writeFileSync(__base + 'style_regression/test/data.json', json);
  } catch(err) {
    console.log(err);
  };
};

module.exports = CompareScreeshots;