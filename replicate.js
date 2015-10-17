/*
Copyright 2015 Sleepless Software Inc. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE. 
*/


replicate = function( id, data, callback ) {

	if( ! replicate.templates ) {

		// first call to function

		replicate.seq = 1;			// used when generating id's
		replicate.templates = {};	// initialize template cache

		// replaces instances of "__key__" in string s, with values from corresponding key in data
		replicate.substitute = function( s, data ) {
			for( var key in data ) {
				var re = new RegExp( "__" + key + "__", "g" );
				s = s.replace( re, ""+(data[ key ]) );
			}
			return s;
		}

		// injects data values into a single element
		replicate.inject = function( e, data ) {

			// inject into the body of the element
			e.innerHTML = replicate.substitute( e.innerHTML, data );

			// inject into the attributes of the actual tag of the element
			// do this slightly differently for IE because IE is stupid
			var attrs = e.attributes;
			if( navigator.appName == "Microsoft Internet Explorer" ) {
				for( var k in attrs ) {
					var val = e.getAttribute( k );
					if( val ) {
						if( typeof val === "string" ) {
							if( val.match( /__/ ) ) {
								val = replicate.substitute( val, data );
								e.setAttribute( k, val );
							}
						}
					}
				}
			}
			else {
				for( var i = 0 ; i < attrs.length ; i++ ) {
					var attr = attrs[ i ];
					var val = attr.value;
					if( val ) {
						if( typeof val === "string" ) {
							if( val.match( /__/ ) ) {
								attr.value = replicate.substitute( val, data );
							}
						}
					}
				}
			}
		}


		// removes clones previously injected into DOM (if any), and replace the template back into the dom at
		// it's original position
		replicate.reset = function( key ) {

			var tem = replicate.templates[ key ];
			if( ! tem ) 
				return;
	
			var clones = tem.clones;
			var l = clones.length;
			if( l > 0 ) {
				// remove the clones.
				for( var i = 0; i < l; i++ ) {
					var clone = clones[ i ];
					if( clone.parentNode ) {	// could be null if already removed from DOM
						clone.parentNode.removeChild( clone );
					}
				}
			}

			tem.mom.insertBefore( tem, tem.sib ); // put template back into DOM
		}

	}


	if(typeof id === "undefined") {
		return;
	}

	var tem = null;

	if( typeof id === "object" ) {
		// an element is being passed in rather than the an id
		tem = id;
		id = tem.replicateId;
		if( ! id ) {
			id = "replicate_" + replicate.seq;
			replicate.seq += 1;
			tem.replicateId = id;
		}
	}

	if( id ) {
		replicate.reset( id );
	}

	if( ! tem ) {
		tem = document.getElementById( id );
		if( ! tem ) {
			console.log( "replicate: template not found: " + id );
			return;
		}
	}

	replicate.templates[ id ] = tem;		// store the template element in cache

	if( typeof data !== "object" ) {
		console.log( "replicate: invalid replication data: " + data );
		return
	}

	if( ! ( data instanceof Array ) ) {
		data = [ data ]
	}

	// store some stuff into the template element
	tem.mom = tem.parentNode;			// mommy
	tem.sib = tem.nextSibling 			// sibling - might be null
	tem.parentNode.removeChild( tem );	// take template out of the DOM
	tem.clones = [];					// prep array for references to the clones

	// now walk through the data array
	// each entry in the array is an object
	// clone the template for each object, and inject the data from the object into the clone
	var l = data.length
	for( var i = 0 ; i < l ; i++ ) {
		var d = data[ i ]

		var e = tem.cloneNode( true )			// clone the template
		e.removeAttribute( "id" );				// clear the id from the cloned element

		tem.clones.push( e );					// put the clone into the reference array for later

		tem.mom.insertBefore( e, tem.sib );		// insert the clone into the dom

		replicate.inject( e, d );				// inject the data into the element

		if( callback ) {
			callback( e, d, i );				// lets caller do stuff after each clone is created
		}
	}

}

replicate();	// so the inject() function inside gets initialized.


