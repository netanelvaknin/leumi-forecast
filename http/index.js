const axios = require('axios');

const instanceConfig = {
    baseURL: 'https://api.openweathermap.org/',
    headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
    },
};

const http = axios.create(instanceConfig);

module.exports = http;