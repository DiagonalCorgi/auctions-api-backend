import * as db from "../../config/db"
import * as errors from "../services/errors"
import * as tools from "../services/tools"
import e, {NextFunction, Request, Response} from "express";
import Logger from "../../config/logger";
import logger from "../../config/logger";



const findUserIdByToken  = async (token: string) : Promise<any> => {
    const findSQL = 'SELECT id FROM `user` WHERE `auth_token` = ?';
    if (!token) {
        // No token provided, hence can't fetch matching user
        return null;
    }
    try {
        const result = await db.getPool().query(findSQL, token);
        const rows = result[0];
        if (rows.length < 1) {
            // No matching user for that token
            return null;
        } else {
            // Return matching user
            return tools.toCamelCase(rows[0]);
        }
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}

const loginRequired = async (req : Request, res: Response, next: NextFunction) => {
    const token = req.header('X-Authorization');
    try {
        const result = await findUserIdByToken(token);
        if (result === null) {
            res.statusMessage = 'Unauthorized';
            res.status(401).send();
        } else {
            req.body.authenticatedUserId = result.id.toString();
            next();
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};


const  setAuthenticatedUser =  async(req : Request, res: Response, next: NextFunction) => {
    const token = req.header('X-Authorization');


    try {
        const result = await findUserIdByToken(token);
        if (result !== null) {
            logger.info(`setting authentication for user ${result.id}`);
            req.body.authenticatedUserId = result.id;
        }
        next();
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
};


export {findUserIdByToken, loginRequired, setAuthenticatedUser}