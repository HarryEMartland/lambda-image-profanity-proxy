const crypto = require('crypto');
require('es6-promise').polyfill();
require('isomorphic-fetch');

const env = process.env;

const googleImageUrl = 'https://vision.googleapis.com/v1/images:annotate?key=';
const googleAPIKey = env.GOOGLE_API_KEY;
const algorithm = env.ENCRYPTION_ALGORITHM || 'aes192';
const key = env.ENCRYPTION_KEY;
const allowedValues = ["VERY_UNLIKELY", "UNLIKELY"];

if (!googleAPIKey) {
    throw new Error("Environment variable GOOGLE_API_KEY not set");
}

if (!key) {
    throw new Error("Environment variable ENCRYPTION_KEY not set");
}

function decryptUrl(encryptedUrl) {
    const decipher = crypto.createDecipher(algorithm, key);
    return decipher.update(encryptedUrl, 'hex', 'utf8') +
        decipher.final('utf8');
}

function doneRedirect(context, redirectUrl) {
    return context.done(null, redirect(redirectUrl));
}

function redirect(redirectUrl) {
    return {
        statusCode: 301,
        headers: {
            "Location": redirectUrl
        }
    }
}

function createGoogleImageRequestBody(imageUrl) {
    return '{"requests": [{"image": {"source": {"imageUri": "' + imageUrl + '"}}, "features": [{"type": "SAFE_SEARCH_DETECTION"}]}]}';
}

function getAdultLikelihood(imageUrl) {
    const requestBody = createGoogleImageRequestBody(imageUrl);

    return fetch(googleImageUrl + googleAPIKey, {
        method: 'POST', body: requestBody
    }).then(function (response) {
        if (response.ok) {
            return response.json()
        } else {
            throw response;
        }
    }).then(function (json) {
        return json.responses[0].safeSearchAnnotation.adult;
    })
}

exports.handler = function (event, context) {

    const imageUrl = decryptUrl(event.queryStringParameters.imageUrl);
    console.log("Image url=", imageUrl);

    getAdultLikelihood(imageUrl).then(function (adultLikelihood) {
        console.log("adultLikelihood=", adultLikelihood);
        if (allowedValues.includes(adultLikelihood)) {
            return doneRedirect(context, imageUrl)
        }else {
            throw new Error("Invalid likelihood");
        }
    }).catch(function (error) {
        console.warn(error);
        context.done(null, {
            statusCode: 404,
        });
    })
};

