"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const fbClass = require("./classFirebird");
const GlobalTypes = require("../common/globalTypes");
const globalFunction = require("../common/globalFunction");
const metadataQuerys = require("./fbMetadataQuerys");
function outFileScript(aFields, aData, aTable, filesPath, aFormat) {
    const saveTo = 100;
    let insertQuery = '';
    let contSaveTo = 0;
    let qSQL = [];
    for (let i = 0; i < aData.length; i++) {
        qSQL = [];
        for (let j = 0; j < aFields.length; j++) {
            if (aFormat === 'sql')
                qSQL.push(globalFunction.varToJSON(aData[i][aFields[j].AName], aFields[j].AType, aFields[j].ASubType));
            else {
                if (j < (aFields.length - 1))
                    insertQuery += globalFunction.varToCSV(aData[i][aFields[j].AName], aFields[j].AType, aFields[j].ASubType) + ',';
                else
                    insertQuery += globalFunction.varToCSV(aData[i][aFields[j].AName], aFields[j].AType, aFields[j].ASubType);
            }
        }
        if (aFormat === 'sql')
            insertQuery += JSON.stringify(qSQL) + GlobalTypes.CR;
        else
            insertQuery += GlobalTypes.CR;
        if (contSaveTo < saveTo)
            contSaveTo++;
        else {
            fs.appendFileSync(filesPath + aTable + '.' + aFormat, insertQuery, 'utf8');
            contSaveTo = 0;
            insertQuery = '';
        }
    }
    fs.appendFileSync(filesPath + aTable + '.' + aFormat, insertQuery, 'utf8');
    contSaveTo = 0;
    insertQuery = '';
}
class fbExtractLoadData {
    constructor() {
        this.formatExport = '';
        this.filesPath = '';
        this.fb = new fbClass.fbConnection;
    }
    analyzeQuery(aQuery, aObjectName, aObjectType) {
        let aRet = aQuery;
        if (aObjectName !== '')
            aRet = aRet.replace('{FILTER_OBJECT}', "WHERE UPPER(TRIM(OBJECT_NAME)) = '" + aObjectName.toUpperCase() + "'");
        else
            aRet = aRet.replace('{FILTER_OBJECT}', '');
        if (aObjectType === GlobalTypes.ArrayobjectType[5]) {
            aRet = aRet.replace('SELECT *', 'SELECT OBJECT_NAME, FIELDNAME, FTYPE, SUBTYPE ');
            aRet = aRet.replace('{RELTYPE}', ' AND (REL.RDB$RELATION_TYPE<>1 OR REL.RDB$RELATION_TYPE IS NULL) /*AND FLD.RDB$COMPUTED_SOURCE IS NULL*/');
        }
        else
            aRet = aRet.replace('{RELTYPE}', ' AND (REL.RDB$RELATION_TYPE NOT IN (1,5,4) OR REL.RDB$RELATION_TYPE IS NULL)');
        return aRet;
    }
    async extractData(ahostName, aportNumber, adatabase, adbUser, adbPassword, objectName) {
        let filepath = this.filesPath; //para poder llamarlo en el callback
        let formatExport = this.formatExport; //para poder llamarlo en el callback          
        let tableName = '';
        let filesDirSource1 = [];
        let rTables = [];
        let rFields = [];
        let rData = [];
        let iField = {};
        let qFields = [];
        let qBlobFields = [];
        let query = '';
        let xCont = 0;
        let xContGral = 0;
        let j = 0;
        this.fb.database = adatabase;
        this.fb.dbPassword = adbPassword;
        this.fb.dbUser = adbUser;
        this.fb.hostName = ahostName;
        this.fb.portNumber = aportNumber;
        try {
            if (!(this.filesPath.endsWith('/')))
                this.filesPath += '/';
            await this.fb.connect();
            try {
                await this.fb.startTransaction(true);
                rTables = await this.fb.query(this.analyzeQuery(metadataQuerys.queryTablesView, objectName, GlobalTypes.ArrayobjectType[2]), []);
                rFields = await this.fb.query(this.analyzeQuery(metadataQuerys.queryTablesViewFields, objectName, GlobalTypes.ArrayobjectType[5]), []);
                await this.fb.commit();
                for (let i = 0; i < rTables.length; i++) {
                    tableName = rTables[i].OBJECT_NAME.trim();
                    if (globalFunction.includeObject(this.excludeObject, GlobalTypes.ArrayobjectType[2], tableName)) {
                        j = rFields.findIndex(aItem => (aItem.OBJECT_NAME.trim() === tableName));
                        qFields = [];
                        qBlobFields = [];
                        if (fs.existsSync(this.filesPath + tableName + '.' + formatExport)) {
                            fs.unlinkSync(this.filesPath + tableName + '.' + formatExport);
                        }
                        if (j !== -1) {
                            while ((j < rFields.length) && (rFields[j].OBJECT_NAME.trim() === tableName)) {
                                if (globalFunction.includeObject(this.excludeObject, GlobalTypes.ArrayobjectType[5], rFields[j].FIELDNAME)) {
                                    iField = {};
                                    iField.AName = rFields[j].FIELDNAME.trim();
                                    iField.AType = rFields[j].FTYPE;
                                    iField.ASubType = rFields[j].SUBTYPE;
                                    qFields.push(iField);
                                    if (iField.AType === 261)
                                        qBlobFields.push(iField);
                                }
                                j++;
                            }
                            await this.fb.startTransaction(true);
                            query = 'SELECT ' + globalFunction.arrayToString(qFields, ',', 'AName') + ' FROM ' + globalFunction.quotedString(tableName);
                            //query += ' where fcodint=33771';
                            rData = [];
                            xCont = 0;
                            xContGral = 0;
                            console.log(i.toString() + '/' + rTables.length.toString() + ' - extract ' + tableName);
                            if (formatExport.toLowerCase() === 'sql')
                                fs.appendFileSync(this.filesPath + tableName + '.sql', '["' + globalFunction.arrayToString(qFields, '","', 'AName') + '"]' + GlobalTypes.CR, 'utf8');
                            else if (formatExport.toLowerCase() === 'csv')
                                fs.appendFileSync(this.filesPath + tableName + '.csv', globalFunction.arrayToString(qFields, ',', 'AName') + GlobalTypes.CR, 'utf8');
                            await this.fb.dbSequentially(query, [], async function (row, index) {
                                let value;
                                if (qBlobFields.length > 0) {
                                    for (let i in qBlobFields) {
                                        if (row[qBlobFields[i].AName] !== null || row[qBlobFields[i].AName] instanceof Function) {
                                            if (qBlobFields[i].ASubType === 0) {
                                                if (formatExport.toLowerCase() === 'sql')
                                                    value = new Buffer(row[qBlobFields[i].AName]).toString('base64');
                                                else
                                                    (formatExport.toLowerCase() === 'csv');
                                                value = new Buffer(row[qBlobFields[i].AName]).toString('hex');
                                                row[qBlobFields[i].AName] = value.toString(); //piso el valor convertido
                                            }
                                        }
                                    }
                                }
                                rData.push(row);
                                xCont++;
                                //console.log(xCont.toString());
                                if (xCont >= 100) {
                                    outFileScript(qFields, rData, tableName, filepath, formatExport);
                                    //fs.appendFileSync('/home/damian/temp/db/'+tableName+'.sql', JSON.stringify(rData), 'utf8');
                                    xContGral += xCont;
                                    console.log('   Registros: ' + xContGral.toString());
                                    rData = [];
                                    xCont = 0;
                                }
                            });
                            if (rData.length > 0) {
                                xContGral += xCont;
                                console.log('   Registros: ' + xContGral.toString());
                                outFileScript(qFields, rData, tableName, filepath, formatExport);
                                //fs.appendFileSync('/home/damian/temp/db/'+tableName+'.sql', JSON.stringify(rData), 'utf8');
                            }
                            await this.fb.commit();
                        }
                    }
                }
            }
            finally {
                await this.fb.disconnect();
            }
        }
        catch (err) {
            console.error(err.message);
            process.exit(1);
        }
    }
}
exports.fbExtractLoadData = fbExtractLoadData;
//# sourceMappingURL=fbExtractLoadData.js.map