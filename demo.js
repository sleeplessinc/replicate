
var show = function( el ) {
	el.style.visibility = "visible";
}

setTimeout(function() {


	// structure of the html is irrelevant.  only the injection points matter.
	var menudata = [
		{ page: "./page1.html", label: "Page #1", },
		{ page: "./page2.html", label: "Page #2", },
	]
	replicate( "menuitem", menudata, show );


	// a repeating set of substitutions using an array of json objects
	var data = [
		{heading: "General", name:"Washington", when:"Jul 4, 1776"},
		{heading: "Sailer", name:"Columbus", when: ""},
		{heading: "Hottie", name:"Nightingale", when: ""},
	]
	replicate( "protodiv", data, show );


	setTimeout(function() {
		// demonstrating resetting and inserting new data.
		var data2 = [
			{heading: "Earth", name:"Home of the brave", when:""},
			{heading: "Mars", name:"Home of the green", when:""},
			{heading: "Venus", name:"Home of the hotties", when:""},
		]
		replicate( "protodiv", data2, show )
	}, 3000)


}, 500)


