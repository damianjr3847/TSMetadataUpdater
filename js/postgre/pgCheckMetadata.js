"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GlobalTypes = require("../common/globalTypes");
const pg = require("pg");
const pgMetadataQuerys = require("./pgMetadataQuerys");
const defaultSchema = 'public';
;
class pgCheckMetadata {
    constructor() {
        this.connectionString = {};
        this.schema = defaultSchema;
        this.dbRole = '';
    }
    analyzeQuery(aQuery, aObjectName, aObjectType) {
        let aRet = aQuery;
        let namesArray = [];
        let aux = '';
        //va con RegExp porque el replace cambia solo la primer ocurrencia.        
        aRet = aRet.replace(new RegExp('{FILTER_SCHEMA}', 'g'), "'" + this.schema + "'");
        if (aObjectName !== '')
            aRet = aRet.replace('{FILTER_OBJECT}', "WHERE UPPER(TRIM(cc.objectName)) = '" + aObjectName.toUpperCase() + "'");
        else {
            aRet = aRet.replace('{FILTER_OBJECT}', '');
        }
        if (aObjectType === GlobalTypes.ArrayobjectType[0])
            aRet = aRet.replace('{RELTYPE}', " and lower(format_type(p.prorettype,null)) <> 'trigger' and  l.lanname = 'plpgsql'  ");
        else if (aObjectType === GlobalTypes.ArrayobjectType[1])
            aRet = aRet.replace('{RELTYPE}', " and lower(format_type(p.prorettype,null)) = 'trigger' and  l.lanname = 'plpgsql' ");
        return aRet;
    }
    async checkProcedures(aobjectName) {
        let dbProcedures = [];
        let result;
        let cRet = { total: 0, cError: 0, cOk: 0 };
        try {
            await this.pgDb.query('BEGIN');
            try {
                result = await this.pgDb.query(this.analyzeQuery(pgMetadataQuerys.queryProcedureTrigger, aobjectName, GlobalTypes.ArrayobjectType[0]));
                dbProcedures = result.rows;
                console.log('\x1b[31m' + 'REVISAR LAS SIGUIENTES FUNCIONES: ');
                console.log('\x1b[31m ');
                for (let i = 0; i < dbProcedures.length; i++) {
                    result = await this.pgDb.query('select plpgsql_check_function as textline from plpgsql_check_function(' + dbProcedures[i].oid + ')');
                    if (result.rows.length > 0) {
                        cRet.cError += 1;
                        console.log('\x1b[31m' + ('Compilando procedure ' + dbProcedures[i].functionName).padEnd(70, '.') + 'ERROR');
                        for (let j = 0; j < result.rows.length; j++) {
                            console.log('\x1b[0m' + result.rows[j].textline);
                        }
                    }
                    else {
                        cRet.cOk += 1;
                        console.log('\x1b[32m' + ('Compilando procedure ' + dbProcedures[i].functionName).padEnd(70, '.') + 'OK');
                    }
                }
            }
            finally {
                console.log('\x1b[0m');
                await this.pgDb.query('COMMIT');
                cRet.total = dbProcedures.length;
                return cRet;
            }
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    async checkTriggers(aobjectName) {
        let dbTrigger = [];
        let result;
        let cRet = { total: 0, cError: 0, cOk: 0 };
        console.log(' ');
        console.log(' ');
        try {
            await this.pgDb.query('BEGIN');
            try {
                result = await this.pgDb.query(this.analyzeQuery(pgMetadataQuerys.queryTrigger, aobjectName, GlobalTypes.ArrayobjectType[1]));
                dbTrigger = result.rows;
                console.log('\x1b[31m' + 'REVISAR LOS SIGUIENTES TRIGGERS: ');
                console.log('\x1b[31m ');
                for (let i = 0; i < dbTrigger.length; i++) {
                    result = await this.pgDb.query("select plpgsql_check_function as textline from plpgsql_check_function('" + dbTrigger[i].functionName + "()','" + dbTrigger[i].tableName + "')");
                    if (result.rows.length > 0) {
                        cRet.cError += 1;
                        console.log('\x1b[31m' + ('Compilando trigger ' + dbTrigger[i].functionName + ' en tabla ' + dbTrigger[i].tableName).padEnd(70, '.') + 'ERROR');
                        for (let j = 0; j < result.rows.length; j++) {
                            console.log('\x1b[0m' + result.rows[j].textline);
                        }
                    }
                    else {
                        cRet.cOk += 1;
                        console.log('\x1b[32m' + ('Compilando trigger ' + dbTrigger[i].functionName + ' en tabla ' + dbTrigger[i].tableName).padEnd(70, '.') + 'OK');
                    }
                }
            }
            finally {
                console.log('\x1b[0m');
                await this.pgDb.query('COMMIT');
                cRet.total = dbTrigger.length;
                return cRet;
            }
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    async checkIndexes(aobjectName) {
        let dbIdx = [];
        let result;
        let tAux = '';
        console.log(' ');
        console.log(' ');
        try {
            await this.pgDb.query('BEGIN');
            try {
                result = await this.pgDb.query(this.analyzeQuery(pgMetadataQuerys.queryCheckIndexes, aobjectName, GlobalTypes.ArrayobjectType[6]));
                dbIdx = result.rows;
                if (dbIdx.length > 0) {
                    console.log('\x1b[31m' + 'REVISAR LOS SIGUIENTES INDICES REDUNDANTES: ');
                    console.log('\x1b[31m\x1b[5m' + '************************************************************');
                    console.log('\x1b[31m\x1b[5m' + '***                 A D V E R T E N C I A                ***');
                    console.log('\x1b[31m\x1b[5m' + '***  ESTO NO QUIERE DECIR QUE TENGA QUE BORRAR ESTOS     ***');
                    console.log('\x1b[31m\x1b[5m' + '***          INDICES EN FORMA INDISCRIMINADA             ***');
                    console.log('\x1b[31m\x1b[5m' + '***       REVISE USTED CUAL ES NECESARIO BORRAR          ***');
                    console.log('\x1b[31m\x1b[5m' + '************************************************************');
                }
                for (let i = 0; i < dbIdx.length; i++) {
                    /*table_name,Deletioncandidateindex,Deletioncandidatecolumns,Existingindex,Existingcolumns"*/
                    if (tAux === '' || tAux !== dbIdx[i].table_name) {
                        tAux = dbIdx[i].table_name;
                        console.log('\x1b[0m');
                        console.log('\x1b[0m' + 'Tabla: ' + dbIdx[i].table_name);
                    }
                    console.log('\x1b[0m' + 'Indice ' + dbIdx[i].Deletioncandidateindex + '(' + dbIdx[i].Deletioncandidatecolumns + '). Esta incluido en ' + dbIdx[i].Existingindex + '(' + dbIdx[i].Existingcolumns + ')');
                }
            }
            finally {
                console.log('\x1b[0m');
                await this.pgDb.query('COMMIT');
            }
        }
        catch (err) {
            throw new Error(err.message);
        }
    }
    //****************************************************************** */
    //        D E C L A R A C I O N E S    P U B L I C A S
    //******************************************************************* */
    async check(ahostName, aportNumber, adatabase, adbUser, adbPassword, adbRole, objectType, objectName) {
        let cFunc = { total: 0, cError: 0, cOk: 0 };
        let cTri = { total: 0, cError: 0, cOk: 0 };
        this.connectionString.host = ahostName;
        this.connectionString.database = adatabase;
        this.connectionString.password = adbPassword;
        this.connectionString.user = adbUser;
        this.connectionString.port = aportNumber;
        this.pgDb = new pg.Client(this.connectionString);
        try {
            await this.pgDb.connect();
            await this.pgDb.query('SET ROLE ' + adbRole);
            this.dbRole = adbRole;
            try {
                if (objectType === '' || objectType === GlobalTypes.ArrayobjectType[0]) {
                    cFunc = await this.checkProcedures(objectName);
                }
                if (objectType === '' || objectType === GlobalTypes.ArrayobjectType[1]) {
                    cTri = await this.checkTriggers(objectName);
                }
                if (objectType === '' || objectType === GlobalTypes.ArrayobjectType[6]) {
                    await this.checkIndexes(objectName);
                }
            }
            finally {
                await this.pgDb.end();
                console.log('');
                console.log('');
                console.log('Resumen:');
                if (objectType === '' || objectType === GlobalTypes.ArrayobjectType[0]) {
                    console.log('');
                    console.log('Total de functiones: ' + cFunc.total.toString());
                    console.log('-Con errores: ' + cFunc.cError.toString());
                    console.log('-Sin errores: ' + cFunc.cOk.toString());
                }
                if (objectType === '' || objectType === GlobalTypes.ArrayobjectType[1]) {
                    console.log('');
                    console.log('Total de triggers: ' + cTri.total.toString());
                    console.log('-Con errores: ' + cTri.cError.toString());
                    console.log('-Sin errores: ' + cTri.cOk.toString());
                }
            }
        }
        catch (err) {
            console.error(err.message);
            process.exit(1);
        }
    }
}
exports.pgCheckMetadata = pgCheckMetadata;
//# sourceMappingURL=pgCheckMetadata.js.map