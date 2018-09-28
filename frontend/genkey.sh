#!/bin/bash
# creates a private_key.pem file
# and a public_key.js file for use in frontend javascript

openssl ecparam -name prime256v1 -genkey -noout -out private_key.pem

printf 'public_key="' > public_key.js
openssl ec -in private_key.pem -outform DER -pubout 2>/dev/null | tail -c 65 | base64 | tr -d '=' | tr '+/' '-_' | sed 's/$/"/' >> public_key.js

