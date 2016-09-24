# Outside Replication of CouchDB Databases

This is a simple node script for doing replications outside CouchDB.
I wrote this, because I had trouble with replicating behind a strange configured proxy.

Currently it replicates docs without attachments.

I hope you enjoy it.

If you think it's useful, let me know!

## TODOs

This is still work in progress.
The flowing has to be done:

* Per host proxy configuration
* Read and create configuration from file
* Replication of attachments
* Write and read _local-docs for storing replication state

And some enhancements:
* Read attachments with streams



Ralf Th. Pietsch <ratopi@abwesend.de>
