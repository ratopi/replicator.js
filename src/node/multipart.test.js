var multipart = require( "./multipart" );

multipart.parse(
	"multipart/mixed; boundary=\"49450685b42e7de32a6892bd21357316\"",
	"--49450685b42e7de32a6892bd21357316\r\nContent-Type: application/json\r\n\r\n{\"_id\":\"9fb6aed6c49e7b6cab99b5121a0a12ae\",\"_rev\":\"1-477fbe37687d63cb23bd147f6ad2944f\",\"text\":\"neu\",\"_revisions\":{\"start\":1,\"ids\":[\"477fbe37687d63cb23bd147f6ad2944f\"]}}\r\n--49450685b42e7de32a6892bd21357316--"
);
