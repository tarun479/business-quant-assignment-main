CREATE DATABASE business_quant_db;
USE business_quant_db;

CREATE TABLE data (
    ticker VARCHAR(255),
    date DATE,
    revenue LONG,
    gp LONG,
    fcf LONG,
    capex LONG
);


LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/Sample-Data-Historic.csv'
INTO TABLE data
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(ticker, @date, revenue, gp, fcf, capex)
SET date = STR_TO_DATE(@date, '%m/%d/%Y');

SELECT * FROM data WHERE ticker = 'AAPL';

SELECT revenue, gp FROM data WHERE ticker = 'AAPL';

SELECT revenue, gp FROM data WHERE ticker = 'AAPL' AND date >= DATE_SUB(NOW(), INTERVAL 5 YEAR);
