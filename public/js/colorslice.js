var started = false;
var canvas;
var context;
var zoom;
var zoomcontext;
var swatch;
var swatchcontext;
var mouse = { x:0
            , y:0
            };
var image;
$(document).ready(function() {
  $canvas = $('#screen');
  canvas = $canvas.get(0);
  context = canvas.getContext('2d');

  $canvas.mousemove(mousemove);
  $canvas.mousedown(mousedown);
  $canvas.mouseup(mouseup);
  $canvas.bind('dragover', cancel);
  $canvas.bind('dragenter', cancel);
  $canvas.bind('dragleave', cancel);
  canvas.addEventListener('drop', drop, false);
  zoom = $('#zoom').get(0);
  zoomcontext = zoom.getContext('2d');
  swatch = $('#swatch').get(0);
  swatchcontext = swatch.getContext('2d');
});

function mousemove(event) {
  // Get the mouse position relative to the canvas element.
  mouse = crossBrowserRelativeMousePos(event);

  if (image) {
    var w = 20;
    var h = 20;
    var imageData = context.getImageData( mouse.x - (w / 2)
                                        , mouse.y - (h / 2)
                                        , w
                                        , h);
    var newCanvas = $('<canvas>')[0];
    newCanvas.width = imageData.width;
    newCanvas.height = imageData.height;
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    zoomcontext.fillStyle = "#000";
    zoomcontext.fillRect(0, 0, zoom.width, zoom.height);
    zoomcontext.drawImage(newCanvas, 0, 0, zoom.width, zoom.height);
    // now highlight the current pixel.
    zoomcontext.fillStyle = "rgba(0, 0, 0, 0.5)";
    zoomcontext.strokeRect(zoom.width / 2 - 1, zoom.width / 2 - 1, 6, 6);

    // now draw current pixel really big in a sidebox
    imageData = zoomcontext.getImageData( zoom.width / 2
                                        , zoom.height / 2
                                        , 1
                                        , 1);
    newCanvas = $('<canvas>')[0];
    newCanvas.width = imageData.width;
    newCanvas.height = imageData.height;
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    swatchcontext.fillStyle = "#000";
    swatchcontext.fillRect(0, 0, swatch.width, swatch.height);
    swatchcontext.drawImage(newCanvas, 0, 0, swatch.width, swatch.height);
  
  }
  // testing
  // if (!started) {
  //     context.lineJoin = 'round';
  //     context.beginPath();
  //     context.moveTo(mouse.x, mouse.y);
  //     started = true;
  //   } else {
  //     context.lineTo(mouse.x, mouse.y);
  //     context.stroke();
  //   }
}

function mousedown(event) {
  return cancel(event);
}

function mouseup(event) {
  // capture pixel, display it.
  var imageData = swatchcontext.getImageData(0, 0, 4, 4);
  var d = imageData.data;
  var colors = [d[0], d[1], d[2], d[3]];
  var color = 'rgba('+ colors.join(', ') +')';
  
  var miniswatch = $('<img>').attr('src', swatch.toDataURL('image/png'))
                             .attr('width', 16)
                             .attr('height', 16);
  var para = $('<p>').text(color)
                     .prepend(miniswatch);
  $('#colors').append(para);
  console.log(para);
}

function drop(event) {
  var file = event.dataTransfer.files[0];
  var reader = new FileReader();

  reader.onload = function (event) {
  image = document.createElement('img');
  image.onload = function () {
    var ratio;
    if (this.width > this.height) {
      ratio = this.height / this.width; // less than 1
      context.drawImage( this, 0, 0
                       , canvas.width
                       , canvas.height * ratio);
    } else { 
      ratio = this.width / this.height;
      context.drawImage( this, 0, 0
                       , ratio * canvas.width // canvas is square.
                       , convas.height);
    }
  };

  image.src = event.target.result;
  };

  reader.readAsDataURL( file );
  return cancel(event);
}

function cancel(event) {
  if (event.preventDefault) event.preventDefault();
  return false;
}


// MIT license, ©2010 Evan Wallace madebyevan.com
function crossBrowserElementPos(e) {
	e = e || window.event;
	var obj = e.target || e.srcElement;
	var x = 0, y = 0;
	while(obj.offsetParent) {
		x += obj.offsetLeft;
		y += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return { 'x': x, 'y': y };
}

function crossBrowserMousePos(e) {
	e = e || window.event;
	return {
		'x': e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
		'y': e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop
	};
}

function crossBrowserRelativeMousePos(e) {
	var element = crossBrowserElementPos(e);
	var mouse = crossBrowserMousePos(e);
	return {
		'x': mouse.x - element.x,
		'y': mouse.y - element.y
	};
}