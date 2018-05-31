# Nomine [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

File rename as express middleware.

## Install

`npm i nomine --save`

## API

```js
const express = require('express');
const app = express();

app.use(nomine({
    prefix: '/rename' // default
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
```

## Usage Example

After starting web-server with used `nomine` middleware it waits for payload sended on `/rename` url (by default).
Payload could look this way:

```json
{
    "dir": "/",
    "from": [
        "bin"
    ],
    "to": [
        "bin2"
    ]
}
```

```sh
$ curl -X PUT -d '{"dir":"/","from":["bin"], "to": ["bin2"]}' http://localhost:3000/rename
EACCES: permission denied, rename '/bin' -> '/bin2'
```

## Related

- [Renamify](https://github.com/coderaiser/node-renamify "Renamify") - rename group of files from a directory

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/nomine.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/node-nomine/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/david/coderaiser/node-nomine.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/nomine "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/node-nomine  "Build Status"
[DependencyStatusURL]:      https://david-dm.org/coderaiser/node-nomine "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/coderaiser/node-nomine?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/node-nomine/badge.svg?branch=master&service=github

