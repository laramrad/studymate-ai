<?php

$frontendUrls = array_filter(array_map(function ($url) {
    return rtrim(trim($url), '/');
}, explode(',', env('FRONTEND_URLS', 'http://localhost:5173,http://127.0.0.1:5173'))));

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'storage/*',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => $frontendUrls,

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];