'use strict';

const path = require('path');
const fs = require('fs');

const test = require('tape');

const nomine = require('..');
const {request} = require('serve-once')(nomine);

test('no options', (t) => {
    const result = nomine();
    
    t.equal(typeof result, 'function', 'should return function');
    t.end();
});

test('not found', async (t) => {
    const {status} = await request.get('/')
    
    t.equal(status, 404, 'should not found');
    t.end();
});

test('wrong method', async (t) => {
    const {body} = await request.get(`/rename`)
    t.equal(body, 'method should be PUT', 'should send message');
    t.end();
});

test('put args: no dir', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {},
    })
    
    t.equal(body, 'dir should be a string!', 'should send message about dir');
    t.end();
});

test('put args: no from', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/hello'
        }
    })
    
    t.equal(body, 'from should be an array!', 'should send message about names');
    t.end();
});

test('put args: no from', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/hello',
            from: []
        }
    })
    
    t.equal(body, 'to should be an array!', 'should send message about names');
    t.end();
});

test('rename: empty', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/hello',
            from: [],
            to: []
        }
    })
    
    t.equal(body, 'rename: ok', 'should send message about names');
    t.end();
});

test('rename: error', async (t) => {
    const {body} = await request.put(`/rename`, {
        body: {
            dir: '/',
            from: ['bin'],
            to: ['hello']
        }
    })
    
    const expected = 'EACCES: permission denied, rename \'/bin\' -> \'/hello\'';
     
    t.equal(body, expected, 'should send error');
    t.end();
});

test('rename', async (t) => {
    const dir = path.join(__dirname, 'fixture', 'two');
    const from = ['1.txt', '2.txt'];
    const to = ['a.txt', 'b.txt'];
    
    const addDir = (name) => {
        return dir + path.sep + name;
    };
    
    const expected = 'rename: ok';
    
    const {body} = await request.put(`/rename`, {
        body: {
            dir,
            from,
            to
        }
    })
    
    const oldNames = from.map(addDir);
    
    to
        .map(addDir)
        .forEach((newName, i) => {
            fs.renameSync(newName, oldNames[i]);
        });
    
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
            to: []
        }
    })
    
    t.equal(body, 'rename: ok', 'should send message about names');
    t.end();
});

