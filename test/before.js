'use strict';

const http = require('http');
const rename = require('..');
const express = require('express');

module.exports = (options, fn) => {
    if (!fn) {
        fn = options;
        options = {};
    }
    
    const app = express();
    const server = http.createServer(app);
    const after = () => {
        server.close();
    };
    
    app.use(rename(options));
    
    server.listen(() => {
        fn(server.address().port, after);
    });
};

