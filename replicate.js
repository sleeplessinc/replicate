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


replicate = function( rid, data, callback ) {

	if( ! replicate.templates ) {

		// first call to function

		replicate.seq = 1;			// used to generating rid's
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

/*
		// removes clones previously injected into DOM (if any), and replace the template back into the dom at
		// it's original position
		replicate.reset = function( rid ) {

			var tem = replicate.templates[ rid ];
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
*/
	}

	if(typeof rid === "undefined") {
		return;
	}

	if( ! ( data instanceof Array ) ) {
		throw new Error( "replicate: replication data is not an array" );
	}
	// check first element in array
	if(data.length > 0 && typeof data[0] !== "object") {
		throw new Error( "replicate: replication data array does not contain objects" );
	}

	var tem = null;

	if( rid instanceof HTMLElement ) { //typeof rid === "object" ) 
		// an element is being passed in rather than an element id
		tem = rid;
		rid = tem.id;
		if( ! rid ) {
			rid = tem.replicateId;
			if( ! rid ) {
				rid = "replicate_" + replicate.seq;
				replicate.seq += 1;
			}
		}
	}
	else
	if( typeof rid === "string" ) {
		tem = document.getElementById( rid );
		if(!tem) {
			tem = replicate.templates[ rid ];
			if( ! tem ) {
				throw new Error( "replicate: template not found: " + rid );
			}
		}
		else {
			tem.sib = tem.nextSibling 			// remember sibling - might be null
			tem.mom = tem.parentNode;			// remember mommy
		}
	}
	else {
		throw new Error( "replicate: invalid template or element id");
	}

	tem.replicateId = rid;

	if(tem.parentNode) {
		tem.parentNode.removeChild( tem );	// take template out of the DOM
	}

	if(!tem.clones) {
		tem.clones = [];					// prep array for references to the clones
	}

	replicate.templates[ rid ] = tem;		// store the template in cache

	// replicate the template by cloning it and injecting the data into it.
	// replace existing clones as we go (as opposed to removing them all first then recreateing, which
	// is disruptive to the UI, and can dramatically change currently viewed page position).
	var l = data.length
	var clones = tem.clones;
	var mom = tem.mom;
	for( var i = 0 ; i < l ; i++ ) {
		var d = data[ i ]					// get the data src
		var cl = clones[ i ];				// get corresponding clone (may be undefined)

		var e = tem.cloneNode( true )		// clone the template
		e.removeAttribute( "id" );			// clear the id from the cloned element

		if(cl) {
			mom.replaceChild(e, cl);
		}
		else {
			mom.insertBefore( e, tem.sib );	// insert the clone into the dom
		}
		clones[i] = e;

		replicate.inject( e, d );			// inject the data into the element

		if( callback ) {
			callback( e, d, i );			// lets caller do stuff after each clone is created
		}
	}
	// remove any previous clones that are in excess of the new data
	while(clones.length > l) {
		clones[l].parentNode.removeChild(clones[l]); //remove();		// IE is so fuckin stupid.
		clones.splice(l, 1);
	}

}

replicate();	// so the inject() function inside gets initialized.


