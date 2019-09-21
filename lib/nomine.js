'use strict';

const renamify = require('renamify');
const pullout = require('pullout');

const rename = (params) => {
    const {
        dir,
        from,
        to,
    } = params;
    
    return renamify(dir, from, to);
};

module.exports = (options) => {
    options = options || {};
    const {
        prefix = '/rename',
    } = options;
    
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
            const {message} = error;
            return res.status(404).send(message);
        };
        
        pullout(req)
            .then(JSON.parse)
            .then(rename)
            .then(send)
            .catch(sendError);
    };
};

