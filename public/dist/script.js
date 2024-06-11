
// Initiate graphs

function convertData(datass) {
    var right = {};
    var wrong = {};

    $.each(datass, function(key, value) {
        right[key] = parseInt(value.right, 10);
        wrong[key] = parseInt(value.wrong, 10);
    });

    var result = {
        right: {},
        wrong: {}
    };

    for (var key in right) {
        result.right['"' + key + '"'] = right[key];
    }

    for (var key in wrong) {
        result.wrong['"' + key + '"'] = wrong[key];
    }

    return result;
}

function generateGraph(datass) {
   var result = convertData(datass);
   var songsData78 = result.right;
   var coffees = result.wrong;

   $('.graph-songs').graphiq({
       data: songsData78,
       fluidParent: ".col",
       height: 100,
       xLineCount: 10,
       dotRadius: 4,
       yLines: true,
       xLines: true,
       dots: true,
       fillOpacity: 0.5,
       fill: true,
       colorUnits: "#c3ecf7"
     });

     $('.graph-coffees').graphiq({
       data: coffees,
       fluidParent: ".col",
       height: 100,
       xLineCount: 3,
       dotRadius: 5,
       yLines: true,
       xLines: true,
       dots: true,
       colorLine: "#d3d1b1",
       colorDot: "#726d60",
       colorXGrid: "#634e1b",
       colorUnits: "#d3d1b1",
       colorFill: "#3a2f23",
       dotStrokeWeight: 3,

     });
}


// Function to clear the graphs
function clearGraphs() {
    // If the graphiq plugin provides a destroy method
    if ($('.graph-songs').data('graphiq')) {
        $('.graph-songs').graphiq('destroy');
    }

    if ($('.graph-coffees').data('graphiq')) {
        $('.graph-coffees').graphiq('destroy');
    }

    // If no destroy method is provided, empty the containers
    $('.graph-songs').empty();
    $('.graph-coffees').empty();
}


document.addEventListener("DOMContentLoaded", function() {
           
		//  $(".container").css("margin-top", "-73%");
		  
		//console.log("LOADED: ", globalKeyStats);
	   // Example usage:
	   const datass = {
	   	A: {right: 1, wrong: 1},
	   	Ab: {right: 1, wrong: 1},
	   	B: { right: 1, wrong: 8 },
	       Bb: { right: 4, wrong: 1 },
	       C: { right: 1, wrong: 1 },
	       D: { right: 7, wrong: 1 },
	       Db: { right: 1, wrong: 9 },
	       E: { right: 2, wrong: 7 },
	       Eb: { right: 1, wrong: 1 },
	       F: { right: 2, wrong: 2 },
	       G: { right: 2, wrong: 1 },
	       Gb: { right: 1, wrong: 1 }
	   };

	 
		 
		 $(".graphiq__graph").attr("width", "100%!important");
		// $(".container").css("margin-top", "-73%");
		
		 
	   $('#reportBtn').click(function() {
	//		$(".container").css("width", "100%!important");
	                  
	                  if ($('.container').hasClass('visible')) {
						  $('.container').toggleClass('visible');
	                      $('#reportBtn').text('Show Report');
						  $(".settings").css("top", "16%");
	                  } else {
	                     
						   
						  $('.container').toggleClass('visible');
	                      $('#reportBtn').text('Hide Report');
						  $(".settings").css("top", "9%");
	                  }
	              });

       });

/*
// Example usage:
const datass = {
	A: {right: 1, wrong: 1},
	Ab: {right: 1, wrong: 1},
	B: { right: 1, wrong: 8 },
    Bb: { right: 4, wrong: 1 },
    C: { right: 1, wrong: 1 },
    D: { right: 7, wrong: 1 },
    Db: { right: 1, wrong: 9 },
    E: { right: 2, wrong: 7 },
    Eb: { right: 1, wrong: 1 },
    F: { right: 2, wrong: 2 },
    G: { right: 2, wrong: 1 },
    Gb: { right: 1, wrong: 1 }
};

var result = convertData(datass);
var songsData78 = result.right;
var coffees = result.wrong;

/*
  var songsData = {
  "Mon" : 80,
  "Tues": 40,
  "Wed" : 60,
  "Thu" : 80,
  "Fri": 40,
  "Sat" : 60,

   };

var coffees = {
  "Mon" : 3,
  "Tues": 2,
  "Wed" : 3,
  "Thu" : 2,
  "Fri" : 1.5,
  "Sat" : 1,
  "Sun" : 2
   };

var cats = {
    "10/12" : 1,
    "10/13" : 4,
    "10/14" : 15,
    "10/15" : 27,
    "10/16" : 48,
    "10/17" : 34,
    "10/18" : 12,
}

var reddit = {
    "10/12" : 3.5,
    "10/13" : 2.3,
    "10/14" : 2,
    "10/15" : 1.5,
    "10/16" : 3,
    "10/17" : 4,
    "10/18" : 7,
}

var feature = {
    "1am" : 20,
    "2am" : 15,
    "3am" : 26,
    "4am" : 23,
    "5am" : 36,
    "6am" : 48,
    "7am" : 89,
    "8am" : 109,
    "9am" : 140,
    "10am" : 162,
    "11am" : 173,
    "12pm" : 201
}


$('.graph-songs').graphiq({
    data: songsData78,
    fluidParent: ".col",
    height: 100,
    xLineCount: 10,
    dotRadius: 4,
    yLines: true,
    xLines: true,
    dots: true,
    fillOpacity: 0.5,
    fill: true,
    colorUnits: "#c3ecf7"
  });

  $('.graph-coffees').graphiq({
    data: coffees,
    fluidParent: ".col",
    height: 100,
    xLineCount: 3,
    dotRadius: 5,
    yLines: true,
    xLines: true,
    dots: true,
    colorLine: "#d3d1b1",
    colorDot: "#726d60",
    colorXGrid: "#634e1b",
    colorUnits: "#d3d1b1",
    colorFill: "#3a2f23",
    dotStrokeWeight: 3,

  });
/*
    $('.graph-cats').graphiq({
    data: cats,
    fluidParent: ".col",
    yLines: false,
    xLines: false,
    dots: false,
    colorLine: "#efede5",
    colorLabels: "#efede5",
    fill: false
  });

      $('.graph-hours').graphiq({
    data: reddit,
    fluidParent: ".col",
    height: 100,
    xLineCount: 2,
    dotRadius: 5,
    yLines: false,
    xLines: true,
    dots: true,
    colorLine: "#2F9C95",
    colorDot: "#A3F7B5",
    colorXGrid: "#788476",
    colorUnits: "#A3F7B5",
    colorFill: "#2a4151"
  });

$('.graph-feature').graphiq({
    data: feature,
    fluidParent: ".col",
    colorFill: "#0B4F6C",
  colorRange: "#0B4F6C",
  colorLabels: "#0B4F6C",
    colorLine: "#145C9E",
    fillOpacity: 0.6,
    yLines: false,
    xLineCount: 2,
    dotRadius: 2,
    colorUnits: "#8ecde2",
    lineWeight: 0,
    dots: false,
    colorDot: "#ffc744",
    colorYGrid: "#041e28",
    colorXGrid: "#eeeeee",
    height: 180
})
*/
