#!/usr/bin/env node

//SQL schema declarative manager

/*
https://codeburst.io/how-to-build-a-command-line-app-in-node-js-using-typescript-google-cloud-functions-and-firebase-4c13b1699a27
https://developer.atlassian.com/blog/2015/11/scripting-with-node/


******** M A N U A L E S   ***********
https://www.typescriptlang.org/

******** L I B R E R I A S ***********
https://www.npmjs.com/package/fs-extra
https://www.npmjs.com/package/@types/fs-extra
https://www.npmjs.com/package/commander
https://www.npmjs.com/package/node-firebird
https://github.com/hgourvest/node-firebird

*/

import * as fs from 'fs';
import * as params from 'commander';

import * as fbExtractMetadata from './fbExtractMetadata';
import * as fbApplyMetadata from './fbApplyMetadata';

import * as GlobalTypes from './globalTypes';

let actionYalm:string       = '';
let source1:string          = '';
let source2:string          = '';

let pathSave:string         = '';
let dbDriver:string         = '';
let dbPath:string           = '';
let dbHost:string           = '';
let dbPort:number           = 3050;
let dbUser:string           = 'SYSDBA';
let dbPass:string           = 'masterkey';
let objectType:string       = '';
let objectName:string       = '';
let pathfilescript:string   = '';
let excludeObject:any;
let excludeObjectStr:string = '';
let saveToLog: boolean      = false;
let excludefrom: string     = '';

/**********para pruebas */
/*let actionYalm:string       = 'write';
let source1:string          = './export/';
let source2:string          = './source2/';

let pathSave:string         = './export/';
let dbDriver:string         = 'fb';
let dbPath:string           = '/pool/testing/demo.gdb';
let dbHost:string           = 'srv-01.sig2k.com';
let dbPort:number           = 3050;
let dbUser:string           = 'SYSDBA';
let dbPass:string           = 'masterkey';
let objectType:string       = '';
let objectName:string       = '';
let pathfilescript:string   = '';//'./export/script.sql';
let excludeObject:any;
let excludeObjectStr:string = '{"tables":["usr$*","rpl$*"],"fields":["rpl$*","usr$*"],"procedures":["usr$*"],"triggers":["rpl$*"]}';
let saveToLog: boolean      = true;
let excludefrom: string     = './export/';

excludeObject= JSON.parse(excludeObjectStr);
*/

params.version('1.0.0');

params.option('-r, --readyalm', 'Lee el directorio de los parametros source1 y/o source2 para aplicar cambios');

params.option('--source1 <source1>', 'Path del directorio a leer');
params.option('--source2 <source2>', 'Path del directorio a leer');

params.option('-w, --writeyalm', 'Genera los archivos yalm en el directorio especificado en pathsave');

params.option('-x, --pathsave <pathsave>', 'Path del directorio donde se guardaran los archivos');

params.option('-d, --dbdriver <dbdriver>', 'Driver de la DB ps=PostgreSql fb=Firebird');
params.option('-h, --dbhost <dbhost>', 'Host DB');
params.option('-o, --dbport <dbport>', 'puerto DB');
params.option('-c, --dbpath <dbpath>', 'path DB');
params.option('-u, --dbuser <dbuser>', 'User DB');
params.option('-p, --dbpass <dbpass>', 'Password DB');

params.option('-t, --objecttype <objecttype>', 'opcional, especifica que tipo de cambios se aplican (procedures,triggers,tables,generators,views)');
params.option('-n, --objectname <objectname>', 'opcional, nombre particular del ObjectType que se desea aplicar');
params.option('-s, --outscript <pathfilescript>', 'opcional, devuelve un archivo con las sentencias sql en vez de ejecutarlas en la base de datos');

params.option('-e, --exclude <excludejson>', 'opcional, json con lo que que quiere excluir {tables:[],fields:[],procedures:[],triggers:[],generator:[],views:[]}')

params.option('--excludefrom <pathexclude>', 'opcional, generar matadata exluyendo objetos de dicho path');

params.option('-l, --savetolog', 'guarda en la db el log de los querys ejecutados');

params.parse(process.argv);

// validacion de parametros


if (params.writeyalm && params.readyalm) {
    console.log('Debe elegir -r o -w no ambos');
    process.exit(1);    
}    
else if (params.writeyalm){ 
    actionYalm = 'write';
}
else if (params.readyalm){ 
    actionYalm = 'read';
}
else {
    console.log('debe haber -r o -w para continuar');
    process.exit(1);
}

if (params.dbdriver) {
    if (GlobalTypes.ArrayDbDriver.indexOf(params.dbdriver) !== -1) {   
        dbDriver = params.dbdriver;
    }
    else {
        console.log('dbdriver puede ser ps=PostgreSql o fb=firebird');
        process.exit(1);    
    }    
}
else {
    console.log('debe especificar un driver de base de datos');    
    process.exit(1);        
}

if (params.pathsave) {
    if (! fs.existsSync(params.pathsave)) {
        console.log('el path %j no existe', params.pathsave);
        process.exit(1);
    }
    pathSave= params.pathsave;
}
else if (actionYalm === 'write') {
    console.log('debe haber un Path del archivo y directorio de los archivos yalm');    
    process.exit(1);
}

if (params.source1) {
    if (! fs.existsSync(params.source1)) {
        console.log('el path source1 %j no existe', params.source1);
        process.exit(1);
    }
    source1= params.source1;
}
else if (actionYalm === 'read') {
    console.log('debe haber un path en source1');    
    process.exit(1);
}

if (params.source2) {
    if (! fs.existsSync(params.source2)) {
        console.log('el path source2 %j no existe', params.source2);
        process.exit(1);
    }
    source2= params.source2;
}


if (params.dbuser) {
    dbUser = params.dbuser; 
}
else {
    console.log('falta dbuser');
    process.exit(1);
}

if (params.dbpass) {
    dbPass = params.dbpass; 
}
else {
    console.log('falta dbpass');
    process.exit(1);
}

if (params.dbhost ) {
    dbHost = params.dbhost; 
}
else {
    console.log('falta dbhost');
    process.exit(1);
}

if (params.dbport ) {
    dbPort = params.dbport; 
}
else {
    console.log('falta dbport');
    process.exit(1);
}

if (params.dbpath ) {
    dbPath = params.dbpath; 
}
else {
    console.log('falta dbpath');
    process.exit(1);
}

if (params.objecttype) {
    if (GlobalTypes.ArrayobjectType.indexOf(params.objecttype) !== -1) {
        objectType = params.objecttype;
    }
    else {
        console.log('objecType solo pueden ser (procedures,triggers,tables,generators)');
        process.exit(1);
    }
}

if (params.objectname) {
    if (objectType = '') {
        console.log('debe haber un objecttype');
        process.exit(1);
    }
}

if (params.outscript) {
    pathfilescript= params.outscript;
}

if (params.exclude) {
    excludeObjectStr=params.exclude;
    excludeObject= JSON.parse(excludeObjectStr);
}    

if (params.savetolog) {
    saveToLog= true;
}

if (params.excludefrom) {
    excludefrom= params.excludefrom;
}

/*console.log('actionYalm: %j',actionYalm);
console.log('pathYalm: %j',pathSave);
console.log('source1: %j',source1);
console.log('source2: %j',source2);
console.log('dbDriver: %j', dbDriver);
console.log('connectionString: %j',dbHost+':'+dbPath);
console.log('dbPort: %j', dbPort);
console.log('dbUser: %j', dbUser);
console.log('dbPass: %j',dbPass);
console.log('objectType: %j', objectType);
console.log('objectName: %j', objectName);
console.log('e '+params.exclude+' '+excludeObject.pepe)
console.log('p '+params.outscript)
*/


(async () => {
    let fbem: fbExtractMetadata.fbExtractMetadata;  
    let fbam: fbApplyMetadata.fbApplyMetadata;

    if (dbDriver === 'fb') {                

        if (actionYalm === 'write') {
            fbem = new fbExtractMetadata.fbExtractMetadata;
            fbem.filesPath = pathSave;
            fbem.excludeObject = excludeObject;

            if (excludefrom !== '') {
                fbem.sources.pathSource1 = excludefrom;
                fbem.excludeFrom= true;
            }    
            await fbem.writeYalm(dbHost,dbPort,dbPath,dbUser,dbPass, objectType, objectName);    
        }
        else if (actionYalm === 'read') {
            fbam = new fbApplyMetadata.fbApplyMetadata;
            fbam.sources.pathSource1 = source1;
            fbam.sources.pathSource2 = source2;
            fbam.pathFileScript= pathfilescript;
            fbam.excludeObject = excludeObject;
            fbam.saveToLog = saveToLog;
            if (pathfilescript !== '')
                if (fs.existsSync(pathfilescript)) {
                    fs.unlinkSync(pathfilescript);
                }
            await fbam.applyYalm(dbHost,dbPort,dbPath,dbUser,dbPass, objectType, objectName);    
        }      
        
    }    

})();  

