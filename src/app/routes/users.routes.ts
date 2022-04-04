import {Express} from "express";
import * as users from '../controllers/users.controller';
import {rootUrl} from "./base.routes"
import * as authenticate from "../middleware/authenticate";

module.exports = (app: Express) => {
    app.route (rootUrl + '/users/register')
        .post (users.register);
    app.route(rootUrl + '/users/login')
        .post(users.login);
    app.route(rootUrl + '/users/logout')
        .post(authenticate.loginRequired, users.logout);
    app.route (rootUrl + '/users/:id')
        .get(authenticate.setAuthenticatedUser, users.view)
        .patch(authenticate.loginRequired, users.change);
};