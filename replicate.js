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
		
		replicate.seq = 1;

		replicate.templates = {};				// initialize template cache

		replicate.substitute = function( s, data ) {
			for( var key in data ) {
				var re = new RegExp( "__" + key + "__", "g" );
				s = s.replace( re, ""+(data[ key ]) );
			}
			return s;
		}

		replicate.inject = function( e, data ) {
			e.innerHTML = replicate.substitute( e.innerHTML, data );
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


	var tem = null;

	if( typeof id === "object" ) {
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

	replicate.templates[ id ] = tem;		// store in cache for later "reset".

	if( typeof data !== "object" ) {
		console.log( "replicate: invalid replication data: " + data );
		return
	}

	if( ! ( data instanceof Array ) ) {
		data = [ data ]
	}

	var mom = tem.parentNode
	tem.mom = mom;

	var sib = tem.nextSibling 	// might be null
	tem.sib = sib;

	tem.parentNode.removeChild( tem );		// take template element out of DOM

	tem.clones = [];	// references to the clones

	var l = data.length
	for( var i = 0 ; i < l ; i++ ) {
		var a = data[ i ]

		var e = tem.cloneNode( true )
		e.removeAttribute( "id" );		// "delete e.id" doesn't work in IE

		tem.clones.push( e );

		mom.insertBefore( e, sib );

		replicate.inject( e, a );

		if( callback ) {
			callback( e, a, i );
		}
	}

}

replicate();	// so the inject() function inside gets initialized.


