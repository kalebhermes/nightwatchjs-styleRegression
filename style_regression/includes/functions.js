// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
} else {
  alert('The File APIs are not fully supported in this browser.');
}


setAsRef = function(test_name, ref_path, test_path){
	var sure = confirm('Are you sure you want to use this image as the reference image for ' + test_name + '? This will replace the current Reference Image and can\'t be undone.');
	if(sure == true){
		//build out commandLine command
		//Put into popover with command
		var command = 'ssh inw177.rfiserve.net cp ' + test_path + ' ' + ref_path;
		console.log(command);
	} else {
		//Print thank you
	}
};

resetRef = function(test_name, ref_path){
	var sure = confirm('Are you sure you want to reset ' + test_name + '\'s Reference Image? This will permanently delete the image and can\'t be undone.')
	if(sure === true){
		var command = 'ssh $HOST rm ' + ref_path;
		console.log(command)
	}
}

popover = new PopOver();