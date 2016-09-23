var log =
	function ( o )
	{
		console.log( JSON.stringify( o, null, "\t" ) );
	};

var replicate =
	function ( config )
	{
		var request = require( "request" );

		var readChanges =
			function ( source )
			{
				var url = source + "/_changes";
				request(
					{
						"method": "GET",
						"url": url,
						"params": {
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
												"params": {
													"revs": true,
													"open_revs": JSON.stringify( revs )
												}
											},
											function ( error, response, body )
											{
												// TODO: Handle multipart!!!!
												newDocs.push( JSON.parse( body ) );
												getNextDoc( missingDocRevs, newDocs );
											}
										);
									};

								var key;
								var entry;

								for ( key in missingDocRevs ) break;

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
					"docs": docs
				};

				if ( docs.length === 0 )
				{
					console.log("nothing to do");
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
							console.log( response );
						}
					);
				}
			};

		readChanges( config.source );
	};


replicate(
	{
//		"source": "http://localhost:55984/aze_prod",
		"source": "http://localhost:55984/test",
		"target": "http://localhost:55984/test2",
		"continuous": true
	}
);
