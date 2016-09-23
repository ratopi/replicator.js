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
