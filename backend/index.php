<?php

// run with sudo php -S 0.0.0.0:80 index.php
if (strncmp($_SERVER['SERVER_SOFTWARE'], 'PHP', 3) === 0) { //if php test server, fix args
	$_GET['args'] = substr($_SERVER['REQUEST_URI'], 1);
}

$secretKey = 'replace-this-with-true-random-data';

function getCSPHeaderName()
{
    $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';

    // For CSP browser support and special strings see online documentation
    // DO NOT use get_browser() since it is 1000+ times slower (15ms response becomes 1s+).
    // @link http://content-security-policy.com/
    if (strpos($userAgent, 'MSIE') !== false) {
        // For IE < 11 add document mode edge
        // @see http://msdn.microsoft.com/en-us/library/ie/dn384051(v=vs.85).aspx
        return 'X-Content-Security-Policy';
    } elseif (strpos($userAgent, '; Trident/7.0;') !== false && strpos($userAgent, 'rv:11.') !== false ||
        strpos($userAgent, ' Firefox/') !== false && intval(substr(strrchr($userAgent, '/'), 1)) < 23) {
        // Use X- prefix for IE11 and Firefox < 23
        return 'X-Content-Security-Policy';
    } elseif (strpos($userAgent, ' Safari/') !== false && strpos($userAgent, 'Version/6.') !== false ||
        strpos($userAgent, ' Chrome/') !== false &&
        intval(substr($userAgent, strpos($userAgent, ' Chrome/') + 8, 2)) < 25) {
        // Use X-Webkit-CSP for Safari 6 and Chrome < 25
        return 'X-Webkit-CSP';
    }
    return 'Content-Security-Policy';
}

/**
 * JSON response, set content type and exit.
 * 
 * @param mixed  $json  Optional structure that is converted to JSON (default is array() => {}).
 * @param string $code  Optional HTTP code (default is '200 OK').
 */
function response($json = array(), $code = '200 OK')
{
    header(sprintf('HTTP/1.1 %s', $code));
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($json, JSON_UNESCAPED_SLASHES);
    exit();
}

function getJsonPost()
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	    throw new Exception('Must be post.');
    }
    if (!isset($_SERVER['CONTENT_TYPE']) && !isset($_SERVER['HTTP_CONTENT_TYPE'])) {
        throw new Exception('Content-Type header not found');
    }
    $contentType = isset($_SERVER['CONTENT_TYPE']) ?
        (string)$_SERVER['CONTENT_TYPE'] : (string)$_SERVER['HTTP_CONTENT_TYPE'];
    if (strncasecmp($contentType, 'application/json', 16) !== 0) {
        throw new Exception('Content-Type header not set to application/json');
    }
    $postData = @file_get_contents('php://input');
    $postData = trim($postData);
    if (empty($postData)) {
        throw new Exception('No post data found.');
    }
    $json = json_decode($postData, true);
    if (is_null($json)) {
        throw new Exception('No valid JSON post: '. json_last_error_msg());
    }
    if (!is_array($json)) {
        throw new Exception('No JSON object posted');
    }
    return $json;
}

/**
 * Get JSON value given a dot-name.
 * 
 * @param  mixed[string] $json         JSON variable
 * @param  string        $name         Name to fetch, possible dot separated to fetch inner objects
 * @param  mixed         $defaultValue Optional default value if the object or value name is not found.
 * 
 * @throws Exception                       If no defaultValue was given and the object or value for the name was not found.
 * 
 * @return mixed                          Value of the name (or defaultValue if not found and default was supplied).
 *
 * NOTE: DO NOT remove the = null, since otherwise we cannot call this function with just 2 arguments
 *      ("Missing argument 3 for .."), although the 'null' is never a real default defaultValue!
 */
function getJsonVar($json, $name, $defaultValue = null)
{
    $names = explode('.', $name);
    $i = 0;
    $value = /*.(mixed).*/ null;
    while ($i < count($names)) {
        if ($i > 0) {
            if (!is_array($value)) {
                if (func_num_args() === 2) {
                    throw new Exception('Did not find "' . $name . '" in JSON');
                }
                return $defaultValue;
            }
            $json = cast('mixed[string]', $value);
        }
        if (!array_key_exists($names[$i], $json)) {
            if (func_num_args() === 2) {
                throw new Exception('Did not find "' . $name . '" in JSON');
            }
            return $defaultValue;
        }
        $value = $json[$names[$i++]];
    }
    return $value;
}


//int $errno , string $errstr, string $errfile, int $errline, array $errcontext)
function errorHandler($errno, $errstr, $errfile, $errline, $errcontext)
{
	throw new Exception($errstr);
}

function exceptionHandler(Exception $ex)
{
    response(array('error'=>$ex->getMessage()), $ex->getCode() === 0 ? '500 Error' : $ex->getCode());
}

set_error_handler('errorHandler');
set_exception_handler('exceptionHandler');

ob_start();
date_default_timezone_set('Europe/Amsterdam');
header('X-Frame-Options: DENY');
header(getCSPHeaderName() + ': default-src: \'none\'');
header('Cache-Control: max-age=0, no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: Thu, 1 Jan 1970 00:00:00 GMT');


if (!isset($_GET['args'])) {
	throw new Exception('Please supply an action');
}

$arguments = explode('/', $_GET['args']);

switch($arguments[0]) {
	case 'token':
		$json = getJsonPost();
        $user = getJsonVar($json, 'user');
        $password = getJsonVar($json, 'password');
        //do password bcrypt (password_hash & verify)
        if ($user === 'invalid') {
        	throw new Exception('Incorrect login', 400);
        }
        $msg = array('ts' => time(), 'user' => $user, 'id' => 42);
		response(array('message' => $msg, 'signature' => hash_hmac('sha256', json_encode($msg), $secretKey)));
	default:
		throw new Exception('Invalid action "' . $arguments[0] . '"');
}
