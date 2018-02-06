'use strict';

const path = require('path');
const fs = require('fs');

const test = require('tape');
const fetch = require('node-fetch');

const nomine = require('..');
const before = require('./before');
const {stringify} = JSON;

test('no options', (t) => {
    const result = nomine();
    
    t.equal(typeof result, 'function', 'should return function');
    t.end();
});

test('not found', (t) => {
    before((port, done) => {
        fetch(`http://localhost:${port}`)
            .then((res) => {
                t.equal(res.status, 404, 'should not found');
                done();
                t.end();
            });
    });
});

test('wrong method', (t) => {
    before((port, done) => {
        fetch(`http://localhost:${port}/rename`)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, 'method should be PUT', 'should send message');
                done();
                t.end();
            });
    });
});

test('put args: no dir', (t) => {
    before((port, done) => {
        const options = {
            method: 'PUT',
            body: stringify({})
        };
        
        fetch(`http://localhost:${port}/rename`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, 'dir should be a string!', 'should send message about dir');
                done();
                t.end();
            });
    });
});

test('put args: no from', (t) => {
    before((port, done) => {
        const options = {
            method: 'PUT',
            body: stringify({
                dir: '/hello'
            })
        };
        
        fetch(`http://localhost:${port}/rename`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, 'from should be an array!', 'should send message about names');
                done();
                t.end();
            });
    });
});

test('put args: no from', (t) => {
    before((port, done) => {
        const options = {
            method: 'PUT',
            body: stringify({
                dir: '/hello',
                from: []
            })
        };
        
        fetch(`http://localhost:${port}/rename`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, 'to should be an array!', 'should send message about names');
                done();
                t.end();
            });
    });
});

test('rename: empty', (t) => {
    before((port, done) => {
        const options = {
            method: 'PUT',
            body: stringify({
                dir: '/hello',
                from: [],
                to: []
            })
        };
        
        fetch(`http://localhost:${port}/rename`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, 'rename: ok', 'should send message about names');
                done();
                t.end();
            });
    });
});

test('rename: error', (t) => {
    before((port, done) => {
        const options = {
            method: 'PUT',
            body: stringify({
                dir: '/',
                from: ['bin'],
                to: ['hello']
            })
        };
        
        const expected = 'EACCES: permission denied, rename \'/bin\' -> \'/hello\'';
        
        fetch(`http://localhost:${port}/rename`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(expected, text, 'should send error');
                done();
                t.end();
            });
    });
});

test('rename', (t) => {
    before((port, done) => {
        const dir = path.join(__dirname, 'fixture', 'two');
        const from = ['1.txt', '2.txt'];
        const to = ['a.txt', 'b.txt'];
        const options = {
            method: 'PUT',
            body: stringify({dir, from, to})
        };
        
        const addDir = (name) => {
            return dir + path.sep + name;
        };
        
        const expected = 'rename: ok';
        
        fetch(`http://localhost:${port}/rename`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, expected, 'should send success message');
                
                const oldNames = from.map(addDir);
                
                to
                    .map(addDir)
                    .forEach((newName, i) => {
                        fs.renameSync(newName, oldNames[i]);
                    });
                
                done();
                t.end();
            });
    });
});

test('rename: options: prefix', (t) => {
    const prefix = '/31337';
    
    before({prefix}, (port, done) => {
        const options = {
            method: 'PUT',
            body: stringify({
                dir: '/hello',
                from: [],
                to: []
            })
        };
        
        fetch(`http://localhost:${port}${prefix}`, options)
            .then((res) => res.text())
            .then((text) => {
                t.equal(text, 'rename: ok', 'should send message about names');
                done();
                t.end();
            });
    });
});

