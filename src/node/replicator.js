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

var log =
	function ( o )
	{
		console.log( typeof o === "undefined" ? "" : ( typeof o === "string" ? o : JSON.stringify( o, null, "\t" ) ) );
	};

var getFirstKey =
	function ( object )
	{
		var key;
		for ( key in object )
		{
			break;
		}

		return key;
	};

var replicate =
	function ( config )
	{
		var request = require( "request" );
		var multipartParser = require( "./multipart" ).parse;

		var readChanges =
			function ( source )
			{
				var url = source + "/_changes";
				request(
					{
						"method": "GET",
						"url": url,
						"qs": {
							"feed": "normal",
							"style": "all_docs",
							"heartbeat": 10000
						}
					},
					function ( error, response, body )
					{
						var docrevs = {};
						var data = JSON.parse( body );

						if ( data.results )
						{
							data.results.forEach(
								function ( o )
								{
									var revs = [];
									o.changes.forEach(
										function ( r )
										{
											revs.push( r.rev );
										}
									);

									docrevs[ o.id ] = revs;
								}
							);
						}

						readMissing( config.target, docrevs );
					}
				);
			};

		var readMissing =
			function ( target, data )
			{
				var url = target + "/_revs_diff";
				request(
					{
						"method": "POST",
						"url": url,
						"headers": { 'content-type': 'application/json' },
						"body": JSON.stringify( data )
					},
					function ( error, response, body )
					{
						var getNextDoc =
							function ( missingDocRevs, newDocs )
							{
								var getDoc =
									function ( source, id, revs )
									{
										var url = source + "/" + id;

										request(
											{
												"method": "GET",
												"url": url,
												"qs": {
													"revs": "true",
													"open_revs": JSON.stringify( revs ),
													"latest": "true"
												}
											},
											function ( error, response, body )
											{
												var doc;

												if ( response.statusCode === 200 )
												{
													if ( response.headers[ "content-type" ].indexOf( "multipart/mixed" ) >= 0 )
													{
														var parts = multipartParser( response.headers, body );

														if ( parts.length !== 1 )
														{
															throw {
																"error": "can handle only one document"
															};
														}

														doc = JSON.parse( parts[ 0 ] );
														delete doc._revisions;

														newDocs.push( doc );

														getNextDoc( missingDocRevs, newDocs );
													}
													else
													{
														doc = JSON.parse( body );
														delete doc._revisions;

														newDocs.push( doc );

														getNextDoc( missingDocRevs, newDocs );
													}
												}
												else
												{
													log( response );
													throw {};
												}
											}
										);
									};

								var entry;

								var key = getFirstKey( missingDocRevs );

								if ( key === undefined )
								{
									postBulkDocs( target, newDocs );
								}
								else
								{
									entry = missingDocRevs[ key ];
									delete missingDocRevs[ key ];

									if ( entry.missing.length > 0 )
									{
										getDoc( config.source, key, entry.missing );
									}
									else
									{
										getNextDoc( missingDocRevs );
									}
								}
							};

						var i;
						var data = JSON.parse( body );

						getNextDoc( data, [] );
					}
				);
			};

		var postBulkDocs =
			function ( target, docs )
			{
				var url = target + "/_bulk_docs";
				var data = {
					"new_edits": false,
					"docs": docs
				};

				if ( docs.length === 0 )
				{
					console.log( "nothing to do" );
				}
				else
				{
					request(
						{
							"method": "POST",
							"url": url,
							"headers": { 'content-type': 'application/json' },
							"body": JSON.stringify( data )
						},
						function ( error, response, body )
						{
							log( response );
						}
					);
				}
			};

		readChanges( config.source );
	};


replicate(
	{
//		"source": "http://localhost:55984/aze_prod",
		"source": "http://localhost:5984/test",
		"target": "http://localhost:5984/test2",
		"continuous": true
	}
);
