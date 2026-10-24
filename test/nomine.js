import path, {dirname} from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {test} from 'supertape';
import {serveOnce} from 'serve-once';
import {nomine} from '../lib/nomine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixtureDir = path.join(__dirname, 'fixture', 'two');
const {request} = serveOnce(nomine);
const {request: requestRoot} = serveOnce(nomine, {root: fixtureDir});
const {request: requestRootTrailing} = serveOnce(nomine, {root: fixtureDir + '/'});

test('nomine: no options', (t) => {
    const result = nomine();
    
    t.equal(typeof result, 'function', 'should return function');
    t.end();
});

test('nomine: not found', async (t) => {
    const {status} = await request.get('/');
    
    t.equal(status, 404, 'should not found');
    t.end();
});

test('nomine: wrong method', async (t) => {
    const {body} = await request.get(`/rename`);
    
    t.equal(body, 'method should be PUT', 'should send message');
    t.end();
});

test('nomine: put args: no dir', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {},
    });
    
    t.equal(body, 'dir should be a string!', 'should send message about dir');
    t.end();
});

test('nomine: put args: no from', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/hello',
        },
    });
    
    t.equal(body, 'from should be an array!', 'should send message about names');
    t.end();
});

test('nomine: put args: no to', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/hello',
            from: [],
        },
    });
    
    t.equal(body, 'to should be an array!', 'should send message about names');
    t.end();
});

test('rename: empty', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/hello',
            from: [],
            to: [],
        },
    });
    
    t.equal(body, 'rename: ok', 'should send message about names');
    t.end();
});

test('rename: error', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/',
            from: ['bin'],
            to: ['hello'],
        },
    });
    
    const expected = `EACCES: permission denied, rename '/bin' -> '/hello'`;
    
    t.equal(body, expected, 'should send error');
    t.end();
});

test('nomine: rename', async (t) => {
    const dir = path.join(__dirname, 'fixture', 'two');
    const from = [
        '1.txt',
        '2.txt',
    ];
    
    const to = [
        'a.txt',
        'b.txt',
    ];
    
    const addDir = (name) => 
        dir + path.sep +
        name;
    
    const expected = 'rename: ok';
    
    const {body} = await request.put(`/rename`, {
        body: {
            dir,
            from,
            to,
        },
    });
    
    const oldNames = from.map(addDir);
    
    for (const [i, newName] of to
        .map(addDir)
        .entries()) {
        fs.renameSync(newName, oldNames[i]);
    }
    
    t.equal(body, expected, 'should send success message');
    t.end();
});

test('rename: options: prefix', async (t) => {
    const prefix = '/31337';
    const options = {
        prefix,
    };
    
    const {body} = await request.put(prefix, {
        options,
        body: {
            dir: '/hello',
            from: [],
            to: [],
        },
    });
    
    t.equal(body, 'rename: ok', 'should send message about names');
    t.end();
});

test('nomine: root: traversal in from: status 404', async (t) => {
    const {status} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['../outside.txt'], to: ['1.txt']},
    });
    
    t.equal(status, 404);
    t.end();
});

test('nomine: root: traversal in from: body contains beyond root', async (t) => {
    const {body} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['../outside.txt'], to: ['1.txt']},
    });
    
    t.ok(body.includes('beyond root'), `got: ${body}`);
    t.end();
});

test('nomine: root: traversal in to: status 404', async (t) => {
    const {status} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['1.txt'], to: ['../escaped.txt']},
    });
    
    t.equal(status, 404);
    t.end();
});

test('nomine: root: traversal in to: body contains beyond root', async (t) => {
    const {body} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['1.txt'], to: ['../escaped.txt']},
    });
    
    t.ok(body.includes('beyond root'), `got: ${body}`);
    t.end();
});

test('nomine: root: absolute path outside root: status 404', async (t) => {
    const {status} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['/etc/passwd'], to: ['/tmp/stolen']},
    });
    
    t.equal(status, 404);
    t.end();
});

test('nomine: root: absolute path outside root: body contains beyond root', async (t) => {
    const {body} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['/etc/passwd'], to: ['/tmp/stolen']},
    });
    
    t.ok(body.includes('beyond root'), `got: ${body}`);
    t.end();
});

test('nomine: root: valid rename within root: ok', async (t) => {
    const {body} = await requestRoot.put('/rename', {
        body: {dir: fixtureDir, from: ['1.txt'], to: ['2.txt']},
    });
    
    t.equal(body, 'rename: ok');
    t.end();
});

test('nomine: root: trailing slash on root: ok', async (t) => {
    const {body} = await requestRootTrailing.put('/rename', {
        body: {dir: fixtureDir, from: ['2.txt'], to: ['1.txt']},
    });
    
    t.equal(body, 'rename: ok');
    t.end();
});
