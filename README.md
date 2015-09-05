# mms



# Nginx backend catch all config

```
    location /api {
        rewrite ^/api/(.*)$ /backend/index.php?args=$1 last;
    }
```