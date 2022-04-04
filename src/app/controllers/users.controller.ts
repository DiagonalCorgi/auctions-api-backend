import * as users from '../models/users.model';
import Logger from "../../config/logger";
import {Request, Response} from "express";
import * as passwords from '../services/passwords';
import * as tools from '../services/tools';

const change = async (req: Request, res: Response) : Promise<any> => {
    Logger.info(`U.C Patching through user ${req.params.id}`);

    const userId = parseInt(req.params.id, 10);
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;
    const email = req.body.email;
    const currentPassword = req.body.currentPassword;
    const user = await users.findById(parseInt(req.params.id, 10));
    const userExists = user !== null;
    if (!userExists) {
        res.statusMessage = 'Not Found';
        res.status(404).send();

    } else if (!await tools.equalNumbers(userId, req.body.authenticatedUserId)) {
        // Check that the authenticated user isn't trying to change anyone else's details
        res.statusMessage = 'Forbidden';
        res.status(403).send();

    }
        try {
            await users.modify(userId, firstName, lastName, password, currentPassword, email);
            res.statusMessage = 'OK';
            res.status(200).send();
        } catch (err) {
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')) {
                // Email was already in use
                res.statusMessage = 'Bad Request: email already in use';
                res.status(400).send();
            } else {
                if (!err.hasBeenLogged) Logger.error(err);
                res.statusMessage = 'Internal Server Error';
                res.status(500).send();
            }
        }
}

const view = async (req: Request, res: Response) : Promise<void> => {
    Logger.info(`U.C GET single user id: ${req.params.id}`)
    const id = parseInt(req.params.id, 10);
    const checkId = req.body.authenticatedUserId;

    if (id === checkId) {
        const userData = await users.getOne(id);
        const data = {
            "firstName": userData.first_name,
            "lastName": userData.last_name,
            "email": userData.email
        }
        if (userData == null) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            res.statusMessage = 'OK';
            res.status(200).json(data);
        }
    } else {
        const userData = await users.getOne(id);
        const data = {
            "firstName": userData.first_name,
            "lastName": userData.last_name
        }
        if (userData == null) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            res.statusMessage = 'OK';
            res.status(200).json(data);
        }
    }

}


const login = async (req: Request, res: Response) : Promise<void> => {
    Logger.info("U.C Logging in user" + req.body.email);
        try {
            const foundUser = await users.findByEmail(req.body.email);
            if (foundUser == null) {
                // Either no user found or password check failed
                res.statusMessage = 'Bad Request: invalid email/password supplied';
                res.status(400).send();
            } else {
                const passwordCorrect = await passwords.compare(req.body.password, foundUser.password);
                if (passwordCorrect) {
                    const loginResult = await users.login(foundUser.id);
                    res.statusMessage = 'OK';
                    res.status(200).json(loginResult);
                } else {
                    res.statusMessage = 'Bad Request: invalid email/password supplied';
                    res.status(400).send();
                }
            }
        } catch (err) {
            // Something went wrong with either password hashing or logging in
            if (!err.hasBeenLogged) Logger.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500).send();
        }
}

const logout = async (req: Request, res: Response) : Promise<void> => {
    Logger.info("U.C Logout user" + req.body.authenticatedUserId);
    const userId = req.body.authenticatedUserId;
    try {
        await users.logout(userId);
        res.statusMessage = 'OK';
        res.status(200).send();
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}


const register = async (req: Request, res: Response) : Promise<void> => {
    Logger.info("U.C Registering user");
    if (req.body.firstName == null || req.body.lastName == null || req.body.email == null || req.body.password == null || !req.body.email.includes('@')) {
        res.statusMessage = 'Bad Request';
        res.status(400).send();
    } else {
        try {
            const userId = await users.insert(req.body.firstName, req.body.lastName, req.body.email, req.body.password);
            res.statusMessage = 'Created';
            res.status(201).json({"userId": Number(userId)});
        } catch (err) {
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')) {
                res.statusMessage = 'Bad Request: email already in use';
                res.status(400).send();
            } else {
                if (!err.hasBeenLogged) Logger.error(err);
                res.status(500).send();
            }
        }
    }

};



export { register, login, logout, view, change };