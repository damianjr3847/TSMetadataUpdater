"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryProcedure = `SELECT * 
     FROM ( SELECT TRIM(RDB$PROCEDURE_NAME) AS OBJECT_NAME,
                RDB$PROCEDURE_SOURCE AS SOURCE,
                RDB$DESCRIPTION AS DESCRIPTION
            FROM RDB$PROCEDURES PPA
            WHERE RDB$SYSTEM_FLAG=0
            ORDER BY RDB$PROCEDURE_NAME)
    {FILTER_OBJECT} `;
exports.queryProcedureParameters = `SELECT *
    FROM (SELECT 
            TRIM(PPA.RDB$PROCEDURE_NAME) AS OBJECT_NAME, 
            TRIM(PPA.RDB$PARAMETER_NAME) AS PARAMATER_NAME,
            FLD.RDB$FIELD_TYPE AS FTYPE, 
            FLD.RDB$FIELD_SUB_TYPE AS FSUB_TYPE,
            FLD.RDB$FIELD_LENGTH AS FLENGTH, 
            FLD.RDB$FIELD_PRECISION AS FPRECISION, 
            FLD.RDB$FIELD_SCALE AS FSCALE, 
            TRIM(COL.RDB$COLLATION_NAME) AS FCOLLATION_NAME,        /* COLLATE*/
            PPA.RDB$DEFAULT_SOURCE AS FSOURCE,        /* DEFAULT*/
            PPA.RDB$NULL_FLAG  AS FLAG,             /* NULLABLE*/
            FLD.RDB$DESCRIPTION AS DESCRIPTION, 
            PPA.RDB$PARAMETER_TYPE AS PARAMATER_TYPE         /* input / output*/
        FROM RDB$PROCEDURE_PARAMETERS PPA 
        LEFT OUTER JOIN RDB$FIELDS FLD ON FLD.RDB$FIELD_NAME = PPA.RDB$FIELD_SOURCE 
        LEFT OUTER JOIN RDB$COLLATIONS COL ON (PPA.RDB$COLLATION_ID = COL.RDB$COLLATION_ID AND FLD.RDB$CHARACTER_SET_ID = COL.RDB$CHARACTER_SET_ID)             
        ORDER BY PPA.RDB$PROCEDURE_NAME, PPA.RDB$PARAMETER_TYPE, PPA.RDB$PARAMETER_NUMBER)
    {FILTER_OBJECT} `;
exports.queryTablesView = `SELECT * 
     FROM (SELECT REL.RDB$RELATION_NAME AS OBJECT_NAME, REL.RDB$VIEW_SOURCE AS SOURCE, REL.RDB$DESCRIPTION AS DESCRIPTION, REL.RDB$RELATION_TYPE AS RELTYPE
            FROM RDB$RELATIONS REL
            WHERE REL.RDB$SYSTEM_FLAG=0 AND REL.RDB$RELATION_NAME NOT STARTING 'IBE$' {RELTYPE}
            ORDER BY REL.RDB$RELATION_NAME)
    {FILTER_OBJECT}`;
exports.queryTablesViewFields = `SELECT * 
     FROM ( SELECT  
                REL.RDB$RELATION_NAME AS OBJECT_NAME, RFR.RDB$FIELD_NAME AS FIELDNAME, FLD.RDB$FIELD_TYPE AS FTYPE, 
                FLD.RDB$FIELD_SUB_TYPE AS SUBTYPE, FLD.RDB$CHARACTER_LENGTH AS FLENGTH,
                FLD.RDB$FIELD_PRECISION AS FPRECISION, FLD.RDB$FIELD_SCALE AS SCALE, CHR.RDB$CHARACTER_SET_NAME AS CHARACTERSET,
                COL.RDB$COLLATION_NAME AS FCOLLATION, 
                RFR.RDB$DEFAULT_SOURCE AS DEFSOURCE, RFR.RDB$NULL_FLAG AS FLAG, FLD.RDB$VALIDATION_SOURCE AS VALSOURCE, 
                FLD.RDB$COMPUTED_SOURCE AS COMSOURCE, FLD.RDB$DESCRIPTION AS DESCRIPTION
            FROM RDB$RELATIONS REL
            LEFT OUTER JOIN RDB$RELATION_FIELDS RFR ON RFR.RDB$RELATION_NAME=REL.RDB$RELATION_NAME
            LEFT OUTER JOIN RDB$FIELDS FLD ON FLD.RDB$FIELD_NAME = RFR.RDB$FIELD_SOURCE
            LEFT OUTER JOIN RDB$CHARACTER_SETS CHR ON CHR.RDB$CHARACTER_SET_ID = FLD.RDB$CHARACTER_SET_ID  
            LEFT OUTER JOIN RDB$COLLATIONS COL ON COL.RDB$COLLATION_ID = COALESCE(RFR.RDB$COLLATION_ID, FLD.RDB$COLLATION_ID) AND COL.RDB$CHARACTER_SET_ID = FLD.RDB$CHARACTER_SET_ID
            WHERE REL.RDB$SYSTEM_FLAG=0 AND REL.RDB$RELATION_NAME NOT STARTING 'IBE$' {RELTYPE}
            ORDER BY RFR.RDB$RELATION_NAME, RFR.RDB$FIELD_POSITION, RFR.RDB$FIELD_NAME)
    {FILTER_OBJECT}`;
exports.queryTablesIndexes = `SELECT * 
    FROM (SELECT  REL.RDB$RELATION_NAME AS OBJECT_NAME, REL.RDB$INDEX_NAME AS INDEXNAME, REL.RDB$UNIQUE_FLAG AS FUNIQUE, 
                  REL.RDB$INDEX_INACTIVE AS INACTIVE,
                  REL.RDB$INDEX_TYPE AS FTYPE,REL.RDB$EXPRESSION_SOURCE AS SOURCE, REL.RDB$DESCRIPTION AS DESCRIPTION
        FROM RDB$INDICES REL
        LEFT OUTER JOIN RDB$RELATION_CONSTRAINTS CON ON CON.RDB$INDEX_NAME = REL.RDB$INDEX_NAME
        WHERE REL.RDB$SYSTEM_FLAG=0 AND CON.RDB$INDEX_NAME IS NULL AND REL.RDB$RELATION_NAME NOT STARTING 'IBE$' 
        ORDER BY REL.RDB$RELATION_NAME, REL.RDB$INDEX_NAME)
    {FILTER_OBJECT}`;
exports.queryTableIndexesField = `SELECT * 
    FROM (SELECT REL.RDB$RELATION_NAME AS OBJECT_NAME, REL.RDB$INDEX_NAME AS INDEXNAME, SEG.RDB$FIELD_POSITION AS FPOSITION, SEG.RDB$FIELD_NAME FLDNAME
          FROM RDB$INDICES REL
          INNER JOIN RDB$INDEX_SEGMENTS SEG ON SEG.RDB$INDEX_NAME=REL.RDB$INDEX_NAME
          WHERE REL.RDB$SYSTEM_FLAG=0  AND REL.RDB$RELATION_NAME NOT STARTING 'IBE$'
              /*AND NOT EXISTS(SELECT 1 FROM RDB$RELATION_CONSTRAINTS CON WHERE CON.RDB$CONSTRAINT_NAME=REL.RDB$INDEX_NAME) /*PARA QUE NO TRAIGA LOS CAMPOS DE LAS CLAVES PRIMARIAS*/
          ORDER BY SEG.RDB$INDEX_NAME, SEG.RDB$FIELD_POSITION)
     {FILTER_OBJECT}`;
exports.queryTableCheckConstraint = `SELECT *
    FROM (SELECT REL.RDB$RELATION_NAME AS OBJECT_NAME, CON.RDB$CONSTRAINT_NAME AS CONST_NAME, CON.RDB$CONSTRAINT_TYPE AS CONST_TYPE, 
                 CON.RDB$INDEX_NAME AS INDEXNAME, 
                 IDX.RDB$INDEX_TYPE AS INDEXTYPE,
                 RLC.RDB$RELATION_NAME AS REF_TABLE,
                 RLC.RDB$INDEX_NAME AS REF_INDEX,
                 REF.RDB$UPDATE_RULE AS REF_UPDATE,
                 REF.RDB$DELETE_RULE AS REF_DELETE,
                 IDX.RDB$DESCRIPTION AS DESCRIPTION,
                 (SELECT RTR.RDB$TRIGGER_SOURCE
                  FROM RDB$CHECK_CONSTRAINTS RCH
                  INNER JOIN RDB$TRIGGERS RTR ON RTR.RDB$TRIGGER_NAME=RCH.RDB$TRIGGER_NAME AND RTR.RDB$TRIGGER_TYPE=1
                  WHERE RCH.RDB$CONSTRAINT_NAME=CON.RDB$CONSTRAINT_NAME) AS CHECK_SOURCE
        FROM RDB$RELATIONS REL
        LEFT OUTER JOIN RDB$RELATION_CONSTRAINTS CON ON CON.RDB$RELATION_NAME=REL.RDB$RELATION_NAME
        LEFT OUTER JOIN RDB$INDICES IDX ON IDX.RDB$INDEX_NAME=CON.RDB$INDEX_NAME
        LEFT OUTER JOIN RDB$REF_CONSTRAINTS REF ON REF.RDB$CONSTRAINT_NAME=CON.RDB$CONSTRAINT_NAME
        LEFT OUTER JOIN RDB$RELATION_CONSTRAINTS RLC ON RLC.RDB$CONSTRAINT_NAME=REF.RDB$CONST_NAME_UQ
        WHERE REL.RDB$SYSTEM_FLAG=0 AND CON.RDB$CONSTRAINT_TYPE IN ('CHECK','FOREIGN KEY','PRIMARY KEY')
        ORDER BY CON.RDB$RELATION_NAME, CON.RDB$CONSTRAINT_TYPE, CON.RDB$CONSTRAINT_NAME)
     {FILTER_OBJECT} `;
exports.queryGenerator = `SELECT *
     FROM (SELECT RDB$GENERATOR_NAME AS OBJECT_NAME, RDB$DESCRIPTION AS DESCRIPTION,  RDB$GENERATORS.RDB$GENERATOR_INCREMENT AS INCREMENT
          FROM RDB$GENERATORS 
          WHERE RDB$SYSTEM_FLAG = 0 AND RDB$GENERATOR_NAME NOT STARTING 'IBE$'
          ORDER BY RDB$GENERATOR_NAME)
     {FILTER_OBJECT}`;
exports.queryTrigger = `SELECT *
    FROM (SELECT  TRG.RDB$TRIGGER_NAME AS OBJECT_NAME, TRG.RDB$RELATION_NAME AS TABLENAME, TRG.RDB$TRIGGER_SOURCE AS SOURCE, 
                  TRG.RDB$TRIGGER_SEQUENCE AS SEQUENCE,
                  TRG.RDB$TRIGGER_TYPE AS TTYPE, TRG.RDB$TRIGGER_INACTIVE AS INACTIVE, TRG.RDB$DESCRIPTION AS DESCRIPTION
          FROM RDB$TRIGGERS TRG
          LEFT OUTER JOIN RDB$CHECK_CONSTRAINTS CON ON (CON.RDB$TRIGGER_NAME = TRG.RDB$TRIGGER_NAME)
          WHERE ((TRG.RDB$SYSTEM_FLAG = 0) OR (TRG.RDB$SYSTEM_FLAG IS NULL)) AND (CON.RDB$TRIGGER_NAME IS NULL) AND UPPER(TRG.RDB$TRIGGER_NAME) NOT STARTING 'IBE$'
          ORDER BY TRG.RDB$TRIGGER_NAME)
    {FILTER_OBJECT}`;
exports.queryCheckIndexes = `WITH RECURSIVE INDEXES (TABLE_NAME,INDEX_NAME,COLUMNS) AS (

    SELECT REL.RDB$RELATION_NAME AS table_name, REL.RDB$INDEX_NAME AS index_name,
            (SELECT LIST(COLUMN_NAME)
             FROM (SELECT TRIM(XSEG.RDB$FIELD_NAME) AS COLUMN_NAME
                  FROM RDB$INDEX_SEGMENTS XSEG
                  WHERE XSEG.RDB$INDEX_NAME=REL.RDB$INDEX_NAME
                  ORDER BY XSEG.RDB$FIELD_POSITION)) AS  columns
 
    FROM RDB$INDICES REL
    INNER JOIN RDB$INDEX_SEGMENTS SEG ON SEG.RDB$INDEX_NAME=REL.RDB$INDEX_NAME
    WHERE REL.RDB$SYSTEM_FLAG=0  AND REL.RDB$RELATION_NAME NOT STARTING 'IBE$'
          AND NOT EXISTS(SELECT 1 FROM RDB$RELATION_CONSTRAINTS CON WHERE CON.RDB$CONSTRAINT_NAME=REL.RDB$INDEX_NAME)
    GROUP BY 1,2)
 
 SELECT
     I.TABLE_NAME,
     I.INDEX_NAME AS "Deletioncandidateindex",
     I.COLUMNS AS "Deletioncandidatecolumns",
     J.INDEX_NAME AS "Existingindex",
     J.COLUMNS AS "Existingcolumns"
 FROM INDEXES I
 JOIN INDEXES J ON I.TABLE_NAME = J.TABLE_NAME AND J.COLUMNS LIKE I.COLUMNS || ',%';`;
//# sourceMappingURL=fbMetadataQuerys.js.map