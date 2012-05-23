<?php
/**
 * a very dirty proxy
 *
 * i will start changing this so it passes on
 * any proxy info coming from the browser or
 * elsewhere, for now at least this works for 
 * testing.
 * For rabe.ch this will not need apikey supprt
 * since rabe.ch has an allow rule on its ip.
 */

if (array_key_exists('HTTP_IF_NONE_MATCH', $_SERVER)) {
    $ifNoneMatch = $_SERVER['HTTP_IF_NONE_MATCH'];
    $header = 'If-None-Match: '.$ifNoneMatch."\r\n";
} else {
    $header = '';
}
$ctxt = stream_context_create(
    array(
        'http' => array(
            'method' => 'GET',
            'header' => $header
        )
    )
);

$res = file_get_contents("http://intranet.rabe.ch/songticker/0.9.3/test.php", false, $ctxt);
foreach ($http_response_header AS $header) {
    if (substr($header, 0, 5) == 'ETag:') {
        $etag = substr($header, 6);
    }
}

header('Content-Type: application/xml');
header('ETag: '.$etag);
echo $res;
