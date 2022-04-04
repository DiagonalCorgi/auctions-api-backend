import * as db from "../../config/db";
import {getPool} from "../../config/db";
import Logger from "../../config/logger";
import logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";
import * as randtoken from 'rand-token';
import * as errors from "../services/errors";
import * as tools from "../services/tools";
import * as passwords from "../services/passwords";


const getOne = async (id: number) : Promise<User>  => {
    Logger.info(`U.M Getting user ${id} from the database`);
    const query = 'SELECT * FROM `user` WHERE `id` = ?';
    try {
        const conn = await getPool().getConnection();
        const [rows] = await conn.query( query, [ id ] );
        conn.release();
        return rows[0];
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
}


const login = async (userId: number) : Promise<User> => {
    Logger.info(`U.M logging user ${userId} to the server`);
    const loginSQL = "UPDATE `user` SET `auth_token` = ? WHERE `id` = ?";
    const token = randtoken.generate(32);
    try {
        await db.getPool().query(loginSQL, [token, userId]);;
        return {"userId": userId, "token": token}
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}

const logout = async (userId: number) => {
    Logger.info(`U.M logging user ${userId} out of the server`);
    const logoutSQL = 'UPDATE `user` SET `auth_token` = NULL WHERE `id` = ?';

    try {
        await db.getPool().query(logoutSQL, userId);
    } catch (err) {
        errors.logSqlError(err);
        throw err;
    }
}

const findByEmail = async (email: string) : Promise<any> => {
    Logger.info(`U.M finding user with email: ${email}`);
    const findSQL = 'SELECT * FROM `user` WHERE `email` = ?';

    try {
        const result = await db.getPool().query(findSQL, [email]);
        const rows = result[0];
        return rows.length < 1 ? null : tools.toCamelCase(rows[0]);
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
}


const insert = async (firstName: string, lastName: string, email: string, password: string) : Promise<ResultSetHeader> => {
    logger.info(`U.M Adding user ${email} to the server`);
    const conn = await  getPool().getConnection();
    const createSQL = 'INSERT INTO `user` (`first_name`, `last_name`, `email`, `password`) VALUES (?, ?, ?, ?)';
    const userData = [firstName, lastName, email, await passwords.hash(password)];
    try {
        const [ result ] = await conn.query(createSQL, userData);
        conn.release();
        return result.insertId;
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};



const modify = async (id: number, firstName: any, lastName: any, password: any, currentPassword : any,  email: string) : Promise<any> => {
    const values = [];

    let updateSQL = 'UPDATE `user` SET ';
    logger.info(`U.M modifying user ${id}`);
    if (typeof email !== "undefined" ) {
        updateSQL += "email=?, \n ";
        values.push(email);
    }
    if (typeof firstName !== "undefined" ) {
        updateSQL += "first_name=?, \n ";
        values.push(firstName);
    }
    if (typeof lastName !== "undefined" ) {
        updateSQL += "last_name=?, \n ";
        values.push(lastName);
    }
    if (typeof password !== "undefined" ) {
        updateSQL += "password=? \n ";
        values.push(await passwords.hash(password));
    }
    updateSQL += `WHERE ID = ?`
    values.push(id)
    try {
        logger.info(updateSQL);
        await db.getPool().query(updateSQL, values);
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};

const findById = async (id: number) : Promise<any> => {
    logger.info(`U.M Finding user by id: ${id}`);
    const viewSQL = 'SELECT * FROM `user` WHERE `id` = ?';

    try {
        const result = await db.getPool().query(viewSQL, id);
        const rows = result[0];
        if (rows.length < 1) {
            return null;
        } else {
            return [id];
        }
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
};

const getProfileImageFilename = async (userId: number) : Promise<any> => {
    logger.info(`U.M getting profile image for user ${userId}`);
    const selectSQL = 'SELECT `image_filename` FROM user WHERE `id` = ?';
    try {
        const result = await db.getPool().query(selectSQL, [userId]);
        const rows = result[0];
        logger.info(rows);
        if (rows.length) {
            return tools.toCamelCase(rows[0]);
        }
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
}

const setProfileImageFilename = async (userId: number, imageFilename : any) => {
    logger.info(`U.M set profile image for user ${userId} file ${imageFilename}`);
    const updateSQL = 'UPDATE `user` SET `image_filename` = ? WHERE `id` = ?';

    try {
        const result = await db.getPool().query(updateSQL, [imageFilename, userId]);
        if (result[0].changedRows !== 1) {
            throw Error('Should be exactly one user whose profile image was modified.');
        }
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}




export {insert, login, logout, modify, findByEmail, getOne, findById, getProfileImageFilename, setProfileImageFilename }
