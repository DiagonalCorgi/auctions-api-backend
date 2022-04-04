import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Logger from './logger';
dotenv.config();

const state = {
    // @ts-ignore
    pool: null
};

const connect = async (): Promise<void> => {

    state.pool = await mysql.createPool( {
        multipleStatements: true,
        host: process.env.SENG365_MYSQL_HOST,
        user: process.env.SENG365_MYSQL_USER,
        password: process.env.SENG365_MYSQL_PASSWORD,
        database: process.env.SENG365_MYSQL_DATABASE,
        port: parseInt(process.env.SENG365_MYSQL_PORT,10) || 3306
    } );
    await state.pool.getConnection(); // Check connection
    Logger.info(`Successfully connected to database`)
    return
};

const getPool = () => {
    return state.pool;
};

export {connect, getPool}