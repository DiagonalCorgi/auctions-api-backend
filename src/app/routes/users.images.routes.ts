import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as authenticate from "../middleware/authenticate";
import * as usersImages from '../controllers/users.images.controller';

module.exports = (app: Express) => {
    app.route (rootUrl + '/users/:id/image')
        .get(usersImages.getProfileImage)
        .put(authenticate.loginRequired, usersImages.setProfileImage)
        .delete(authenticate.loginRequired, usersImages.deleteProfileImage);
};