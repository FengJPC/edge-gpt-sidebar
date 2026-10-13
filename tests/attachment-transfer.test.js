import test from 'node:test';import assert from 'node:assert/strict';
import {transferFiles,isFileTransfer} from '../extension/attachment-transfer.js';
test('clipboard image fallback and file drops return files once, text remains untouched',()=>{
 const f={name:'screenshot.png'};
 assert.deepEqual(transferFiles({files:[],items:[{kind:'file',getAsFile:()=>f}]}),[f]);
 assert.deepEqual(transferFiles({files:[f],items:[{kind:'file',getAsFile:()=>f}]}),[f]);
 assert.deepEqual(transferFiles({items:[{kind:'string',type:'text/plain'}]}),[]);
 assert.equal(isFileTransfer({types:['Files']}),true);assert.equal(isFileTransfer({types:['text/plain']}),false);
 assert.deepEqual(transferFiles({items:[{kind:'file',getAsFile:()=>null}]}),[]);
});
