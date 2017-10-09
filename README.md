# Lambda Image Profanity Proxy

A proxy service which will return a 301 (permanent) redirect if an image does not contain adult content.
Images are checked using the google vision api.
Url's are encrypted so the service cannot be hijacked an example request can be seen below.
This is designed to sit behind a cache such as cloud front or cloud flare.
The cache should resolve the redirect and cache the actual image so this service will only be hit with new images or if the cache expires saving lambda and api calls.

### Environment Variables
Your google api key and encryption key are set as environment variables for your lambda function.   
GOOGLE_API_KEY = your google api key  
ENCRYPTION_KEY = the encryption key to use 

There is a flaw with this process as the image could change between the profanity check and the image being cached.

### Example request
https://r3eba4lg07.execute-api.eu-west-1.amazonaws.com/prod/image?imageUrl=b372ae6a49066dfcc1783878cc40502f3255c961aa1b80eb2520cf82fb145e7fc07a89e5a59231cce4a29f4b44f54e7f8c3adaf6067498c32068edcd9a08ac456e5281887cf546ddc100ea5c5bc50d1d

### Encrypting a url using Node

````
const crypto = require('crypto');
const algorithm = 'aes192';
const key = 'a password';
const cipher = crypto.createCipher(algorithm, key);
const url = "https://static.europcar.com/carvisuals/partners/835x557/ECMD_BE.png"

const encryptedUrl = cipher.update(url, 'utf8', 'hex') +
        cipher.final('hex');
        
console.log(encryptedUrl)
//the result will be
//b372ae6a49066dfcc1783878cc40502f3255c961aa1b80eb2520cf82fb145e7fc07a89e5a59231cce4a29f4b44f54e7f8c3adaf6067498c32068edcd9a08ac456e5281887cf546ddc100ea5c5bc50d1d
````