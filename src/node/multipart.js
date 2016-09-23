/*
 License

 Copyright (c) 2016 Ralf Th. Pietsch <ratopi@abwesend.de>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

var parseIt =
	function ( definition, body )
	{
		var results;

		var result = definition.match( /^multipart.*boundary="([^"]*)"/ );
		if ( result )
		{
			results = [];

			var parts = body.split( "--" + result[ 1 ] );
			parts.forEach(
				function ( part, index )
				{
					if ( index === 0 ) return;
					if ( index === parts.length - 1 ) return;

					var border = part.indexOf( "\r\n\r\n" );

					var headerText = part.substring( 2, border );
					var body = part.substring( border + 4, part.length - 2 );

					results.push( body );
				}
			);
		}

		return results;
	};

exports.parse =
	function ( headers, body )
	{
		if ( typeof headers === "string" )
		{
			return parseIt( headers, body );
		}
		else if ( typeof headers === "object" )
		{
			return parseIt( headers[ "content-type" ], body );
		}
		else
		{
			throw "headers must be object or string";
		}
	};
