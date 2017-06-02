# nightwatchjs-styleRegression
Use NightwatchJS to catch style regressions during your normal automation. 

## Catching Style Regressions
If your Dev team is anything like mine, they make changes that regress the visual appearance of your applicaiton. That's bad. But I don't have time to check every page of my appication everytime there's a merge into Master. I have nighlty tests runing to ensure that functionality isn't breaking, so why not ensure that the layout isn't breaking at the same time? That's where comapreScreenshots comes in!

## comapreScreenshots
compareScreenshots is a Nightwatch custom command that compares 'reference' screenshots with a set of 'test' screenshots that are taken everytime you execute your Nightwatch test suite. The first time your tests execute while using compareScreenshots, if no 'reference' shots are available, it will take new ones. Nightwatch will then use these screenshots as the base for compairing the new screenshots it will take with every execution. 

### Example
```
.compareScreenshots('display-tactics', function(result){
  console.log(result);
});

.compareScreenshots('display-tactics');
```
compareScreenshots requires a name, passed as a string, and can accept an optional callback as well. The callback contains the screenshot.

### Report
Once your Nightwatch tests have completed, you'll want a nice report to review the changes made to your application. This report is stored in `style_regression/tests/style_regression_report.html`. This report is generated using the `parser.js` file found in `style_regression/`. 

```node style_regression/parser.js``` from your home directory will generate the report. 

## Installation 
Using comapreScreenshots is easy. Simply download the current release and paste the `customCommands` folder into your Nightwatch parent directory. You'll need to update `nightwatch.json` to point to your new custom command. 

If you're alread using custom commands, it's even easier. You just need to drop `compareScreenshots.js` in your custom command directory. 

You'll need to drop `style_regression/` right in the top level of your Nightwatch directory as well. 

Finally, you'll need to install everything in `package.json`. Right now, the only package there is `Pug`, but keep an eye on `package.json` for updates.  
