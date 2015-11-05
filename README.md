# mms

# Nginx configuration

```
    location / {
            try_files $uri /index.html; 
    }

    location /api/ {
            proxy_pass       http://localhost:4242/;

            proxy_http_version 1.1;
            proxy_set_header Host      $host;
            proxy_set_header X-Real-IP $remote_addr;

            proxy_set_header Connection "Keep-Alive";
            proxy_set_header Proxy-Connection "Keep-Alive";
    }
```