import path from 'node:path';
import {renamify} from 'renamify';
import pullout from 'pullout';

const checkContainment = (dir, names, root) => {
    const normalizedRoot = path.normalize(root);
    const sep = normalizedRoot.endsWith(path.sep) ? '' : path.sep;
    
    for (const name of names) {
        const abs = path.isAbsolute(name) ? path.normalize(name) : path.normalize(path.join(dir, name));
        
        if (abs !== normalizedRoot && !abs.startsWith(normalizedRoot + sep))
            throw Error(`Path ${abs} beyond root ${normalizedRoot}!`);
    }
};

const rename = ({dir, from, to}, root) => {
    if (root)
        checkContainment(dir, from.concat(to), root);
    
    return renamify(dir, from, to);
};

export const nomine = (options) => {
    options = options || {};
    const {prefix = '/rename', root} = options;
    
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
            .then((params) => rename(params, root))
            .then(send)
            .catch(sendError);
    };
};
