
ALTER TABLE AAAAAA2 ALTER COLUMN F2 COMPUTED BY (NEW_FIELD||F1||'AAAAA');
ALTER TABLE AAAAAA2 ADD FOLDPRE DOUBLE PRECISION NOT NULL;
ALTER TABLE AAAAAA2 ADD FNEWPRE DOUBLE PRECISION NOT NULL;
ALTER TABLE AAAAAA2 ADD FLISPRE CHAR(1) NOT NULL;
ALTER TABLE AAAAAA2 ADD FMANUAL CHAR(1);

ALTER TABLE AAAAAAA1 ADD FOLDPRE DOUBLE PRECISION NOT NULL;
ALTER TABLE AAAAAAA1 ADD FNEWPRE DOUBLE PRECISION NOT NULL;
ALTER TABLE AAAAAAA1 ADD FLISPRE CHAR(1) NOT NULL;
ALTER TABLE AAAAAAA1 ADD FMANUAL CHAR(1);

CREATE TABLE ART_ARCH_AUX (
	FCODINT INTEGER NOT NULL,
	FCODIGO VARCHAR(13) NOT NULL,
	FDESCRI VARCHAR(80),
	FCODPRO VARCHAR(20),
	FDIAING TIMESTAMP,
	FBLXPAL SMALLINT NOT NULL,
	FUNIDAD VARCHAR(4),
	FDECIMA CHAR(1) NOT NULL,
	FDECSCR CHAR(1) NOT NULL,
	FPROVED INTEGER,
	FULTCOM TIMESTAMP,
	FLISPR1 DOUBLE PRECISION NOT NULL,
	FLISPR2 DOUBLE PRECISION NOT NULL,
	FULTMOD TIMESTAMP,
	FLISPR3 DOUBLE PRECISION NOT NULL,
	FLISPR4 DOUBLE PRECISION NOT NULL,
	FLISPR5 DOUBLE PRECISION NOT NULL,
	FLISPR6 DOUBLE PRECISION NOT NULL,
	FLISPR7 DOUBLE PRECISION NOT NULL,
	FLISPR8 DOUBLE PRECISION NOT NULL,
	FLISPR9 DOUBLE PRECISION NOT NULL,
	FLISPR0 DOUBLE PRECISION NOT NULL,
	FLISPRO NUMERIC(9,4) NOT NULL,
	FPRECOM DOUBLE PRECISION NOT NULL,
	FSTKMIN INTEGER NOT NULL,
	FBLQMIN CHAR(1) NOT NULL,
	FINGBLQ CHAR(1) NOT NULL,
	FIMPUES NUMERIC(9,4) NOT NULL,
	FPRESUG NUMERIC(9,3) NOT NULL,
	FSUSPEN CHAR(1) NOT NULL,
	FDELETE CHAR(1) NOT NULL,
	FENLIST CHAR(1) NOT NULL,
	FCOSTMA NUMERIC(15,4) NOT NULL,
	FCOSTUC NUMERIC(15,4) NOT NULL,
	FCOSTPP NUMERIC(15,4) NOT NULL,
	FUSUARI INTEGER NOT NULL,
	FUNIKGR FLOAT NOT NULL,
	FUNICON FLOAT NOT NULL,
	FPALFIL SMALLINT NOT NULL,
	FPALBAS SMALLINT NOT NULL,
	FUBICAC VARCHAR(6),
	FCODMAD VARCHAR(13),
	FDESPR1 FLOAT NOT NULL,
	FDESPR2 FLOAT NOT NULL,
	FDESPR3 FLOAT NOT NULL,
	FDESPR4 FLOAT NOT NULL,
	FDESPR5 FLOAT NOT NULL,
	FDESPR6 FLOAT NOT NULL,
	FUTIMIN FLOAT NOT NULL,
	FDESCUE FLOAT NOT NULL,
	FLISPRX NUMERIC(9,4),
	FGRUPO VARCHAR(3),
	FSINDES CHAR(1) NOT NULL,
	FEANUNI VARCHAR(14),
	FEANDIS VARCHAR(14),
	FRECFRA FLOAT,
	FEANBUL VARCHAR(14),
	FPROUNI INTEGER NOT NULL,
	FDECPRO CHAR(1) NOT NULL,
	FIVAPOR CHAR(2) NOT NULL,
	FSUSPRO CHAR(1) NOT NULL,
	FIMPINT FLOAT NOT NULL,
	FCUEVEN INTEGER,
	FCUECOM INTEGER,
	FLOTTRA CHAR(1) NOT NULL,
	FUNILTS DOUBLE PRECISION NOT NULL,
	FUXB NUMERIC(9,3) NOT NULL,
	FUXD NUMERIC(9,3) NOT NULL,
	FCANMIN NUMERIC(9,3) NOT NULL,
	FFABRIC CHAR(5),
	FMODDES CHAR(1) NOT NULL,
	FMODPRE CHAR(1) NOT NULL,
	FSINSTK CHAR(1) NOT NULL,
	FOBSERV VARCHAR(254),
	FRUBRO VARCHAR(4) NOT NULL,
	FULTDES VARCHAR(80),
	FUNICOM CHAR(1) NOT NULL,
	FCANALT CHAR(1) NOT NULL,
	FCOSTEO  COMPUTED BY (FLISPRO*(1-FDESPR1/100)*(1-FDESPR2/100)*(1-FDESPR3/100)*(1-FDESPR4/100)*(1-FDESPR5/100)*(1-FDESPR6/100)),
	FMODUNI CHAR(1),
	FFACTOR NUMERIC(9,2),
	FVENCIM CHAR(1) NOT NULL,
	FMONVEN CHAR(1),
	FMONCOM CHAR(1) NOT NULL,
	FSYNCID BIGINT,
	FKRAFTSI CHAR(1),
	FKRACOD VARCHAR(15));
ALTER TABLE ART_ARCH_AUX ADD CONSTRAINT FK_ART_ARCH_CUECOM FOREIGN KEY (FCUECOM) REFERENCES CON_CUEN (FCUENTA) ON UPDATE CASCADE;
ALTER TABLE ART_ARCH_AUX ADD CONSTRAINT FK_ART_ARCH_CUEVEN FOREIGN KEY (FCUEVEN) REFERENCES CON_CUEN (FCUENTA) ON UPDATE CASCADE;
ALTER TABLE ART_ARCH_AUX ADD CONSTRAINT ART_ARCH_FPROVED CHECK (FPROVED IS NOT NULL);
ALTER TABLE ART_ARCH_AUX ADD CONSTRAINT ART_ARCH_UXB check (FUXB>0);
ALTER TABLE ART_ARCH_AUX ADD CONSTRAINT ART_ARCH_UXD CHECK (FUXD>0);
ALTER TABLE ART_ARCH_AUX ADD CONSTRAINT ART_ARCH_PK PRIMARY KEY (FCODINT);
CREATE  UNIQUE  INDEX ART_ARCH_CODIGO(FCODIGO);
CREATE  INDEX ART_ARCH_CODMAD(FCODMAD);
CREATE  INDEX ART_ARCH_CODPRO(FPROVED,FCODPRO);
CREATE  INDEX ART_ARCH_DELETE(FDELETE);
CREATE  INDEX ART_ARCH_DESCRI(FDESCRI);
CREATE  INDEX ART_ARCH_EANBUL(FEANBUL);
CREATE  INDEX ART_ARCH_EANDIS(FEANDIS);
CREATE  INDEX ART_ARCH_EANUNI(FEANUNI);
CREATE  INDEX ART_ARCH_GRUPO(FGRUPO);
CREATE  INDEX ART_ARCH_IDX1(FDELETE,FVENCIM);
CREATE  INDEX ART_ARCH_RUBRO(FRUBRO);
CREATE  INDEX ART_ARCH_SUSPEN(FSUSPEN);
CREATE  UNIQUE  INDEX ART_ARCH_SYNC(FSYNCID);


SET TERM ^;
CREATE OR ALTER PROCEDURE AFIP_CITI_VENTAS(
DDDE TIMESTAMP,
DHTA TIMESTAMP,
EMPRES VARCHAR(100))RETURNS(
FECHA TIMESTAMP,
COMPRO CHAR(2),
TIPIVA VARCHAR(13),
NOGRAV FLOAT,
TOTAL FLOAT,
NUMERO INTEGER,
IVA1 FLOAT,
IVA2 FLOAT,
PERVAR FLOAT,
GRAV FLOAT,
COMCOD INTEGER,
COMNUM CHAR(8),
CLIENTE VARCHAR(50),
ALICUOTA VARCHAR(4),
COMNUMMAX CHAR(8))
AS
DECLARE VARIABLE NUMANT INTEGER;
DECLARE VARIABLE CANTID INTEGER;
DECLARE VARIABLE CONTADOR INTEGER;
DECLARE VARIABLE COMCOD_AUX VARCHAR(5);
DECLARE VARIABLE TOTIVA NUMERIC(18,2);
DECLARE VARIABLE V_TOTIVA NUMERIC(18,2);
DECLARE VARIABLE IMPUES NUMERIC(15,2);
DECLARE VARIABLE IMPINT NUMERIC(15,2);
begin
NUMANT=0;
FOR
   SELECT D.FDIAFAC,
          CASE (D.FCOMTIP||D.FCOMLET)
               WHEN 'FA' THEN '01'
               WHEN 'DA' THEN '02'
               WHEN 'CA' THEN '03'
               WHEN 'FB' THEN '06'
               WHEN 'DB' THEN '07'
               WHEN 'CB' THEN '08'
               ELSE '00' END,
          CASE WHEN SUBSTRING(D.FCOMCOD FROM  1 FOR 1) IN ('F','C','D') THEN SUBSTRING(D.FCOMCOD FROM 3 FOR 2) ELSE SUBSTRING(D.FCOMCOD FROM 2 FOR 2) END,
          D.FCOMNUM,
          CASE D.FTIPIVA WHEN '3' THEN '27000000006' ELSE REPLACE(C.FCUIT,'-','') END,
          C.FNOMBRE, D.FTOTAL,
          SUM(CAST(I.FCANTID*(I.FPRECIO-I.FIMPUES)*(1-I.FDESCUE/100)*(1-I.FPIEDES/100)*(1-FPIEFIN/100)*(I.FIVA1/100) AS NUMERIC(9,2))),
          SUM(CAST(I.FCANTID*(I.FPRECIO-I.FIMPUES)*(1-I.FDESCUE/100)*(1-I.FPIEDES/100)*(1-FPIEFIN/100)*(I.FIVA2/100) AS NUMERIC(9,2))),
          CASE I.FIVA1 WHEN '10.5' THEN '1050' WHEN '21' THEN '2100' WHEN '27' THEN '2700' ELSE '0000' END,
          D.FFACNUM, D.FIVA1, D.FIMPUES, D.FPERVAR
   FROM FAC_DATO D
   LEFT OUTER JOIN TBL_TIVA T ON D.FTIPIVA=T.FCODIGO
   LEFT OUTER JOIN CLI_ARCH C ON D.FCUENTA=C.FCODINT
   LEFT OUTER JOIN FAC_ITEM I ON D.FFACNUM=I.FFACNUM
   WHERE D.FCOMCOD NOT IN ('I0','Z0') AND D.FDIAFAC BETWEEN :DDDE AND :DHTA AND
         (:EMPRES='*' OR :EMPRES CONTAINING D.FEMPRES) AND ABS(D.FTOTAL)>=0.03 AND C.FCUIT IS NOT NULL
   GROUP BY 1,2,3,4,5,6,7,10,11, 12,13,14
   ORDER BY 1,11,10
   INTO :FECHA, :COMPRO, :COMCOD, :COMNUM, :TIPIVA, :CLIENTE, :TOTAL, :IVA1, :IVA2, :ALICUOTA, :NUMERO, :TOTIVA,
        :impues, :PERVAR
DO BEGIN
   IF (NUMANT=NUMERO) THEN
      CONTADOR=CONTADOR+1;
   ELSE BEGIN
      V_TOTIVA=TOTIVA;
      CONTADOR=1;
      NUMANT=NUMERO;
   END
   NOGRAV=0;
   SELECT COALESCE (SUM(CAST(FCANTID*(FPRECIO-FIMPUES)*(1-FDESCUE/100)*(1-FPIEDES/100)*(1-FPIEFIN/100) AS NUMERIC(18,2))),0)
   FROM FAC_ITEM
   WHERE FFACNUM=:NUMERO AND FIVA1=0
   INTO :NOGRAV;
   NOGRAV=COALESCE(NOGRAV,0)+IMPUES;
   SELECT COUNT(DISTINCT FIVA1) FROM FAC_ITEM WHERE FFACNUM=:NUMERO AND FIVA1<>0 INTO :CANTID;
   IF (CONTADOR=CANTID) THEN
      IVA1=V_TOTIVA;
   ELSE
      V_TOTIVA=V_TOTIVA-IVA1;
   GRAV=0;
   GRAV = TOTAL-(IVA1+IVA2+NOGRAV+PERVAR);
   TOTAL=TOTAL*100;
   GRAV=GRAV*100;
   NOGRAV=NOGRAV*100;
   IVA1=IVA1*100;
   SUSPEND;
END
end
SET TERM ;^
