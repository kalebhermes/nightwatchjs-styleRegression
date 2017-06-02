function PopOver(){
	'use strict'

}

PopOver.prototype.createImagePopover = function(id, type){

	// Get the modal
	var modal = document.getElementById(id + '_modal_' + type);

	// Get the image and insert it inside the modal - use its "alt" text as a caption
	var img = document.getElementById(id + '_img_' + type);
	var modalImg = document.getElementById(id + "_img_1_" + type);
	img.onclick = function(){
	    modal.style.display = "block";
	    modalImg.src = this.src;
	}

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName(id + "_close_" + type)[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() { 
	  modal.style.display = "none";
	}

}

PopOver.prototype.createButtonPopover = function(id, type){

	// Get the modal
	var modal = document.getElementById(id + '_modal_' + type);

	// Get the image and insert it inside the modal - use its "alt" text as a caption
	var img = document.getElementById(id + '_img_' + type);
	var button = document.getElementById(id + '_button_' + type);
	var modalImg = document.getElementById(id + "_img_1_" + type);
	button.onclick = function(){
	    modal.style.display = "block";
	    modalImg.src = img.src;
	}

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName(id + "_close_" + type)[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() { 
	  modal.style.display = "none";
	}

}