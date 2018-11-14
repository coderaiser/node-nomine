'use strict';

const renamify = require('renamify');
const pullout = require('pullout');

const rename = (params) => {
    const dir = params.dir;
    const from = params.from;
    const to = params.to;
    
    return renamify(dir, from, to);
}

module.exports = (options) => {
    options = options || {};
    const prefix = options.prefix || '/rename';
    
    return (req, res, next) => {
        if (req.url !== prefix)
            return next();
        
        if (req.method !== 'PUT')
            return res
                .status(404)
                .send('method should be PUT');
        
        const send = () => {
            res.send('rename: ok');
        };
        
        const sendError = (error) => {
            const message = error.message;
            return res.status(404).send(message);
        };
        
        pullout(req)
            .then(JSON.parse)
            .then(rename)
            .then(send)
            .catch(sendError);
    };
};

