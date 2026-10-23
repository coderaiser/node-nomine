import renamify from 'renamify';
import pullout from 'pullout';

const rename = ({dir, from, to}) => renamify(dir, from, to);

export const nomine = (options) => {
    options = options || {};
    const {prefix = '/rename'} = options;
    
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
        
        const sendError = ({message}) => {
            return res
                .status(404)
                .send(message);
        };
        
        pullout(req)
            .then(JSON.parse)
            .then(rename)
            .then(send)
            .catch(sendError);
    };
};
