import {Express} from "express";
import * as auctions from '../controllers/auctions.controller';
import {rootUrl} from "./base.routes"
import * as authenticate from "../middleware/authenticate";

const baseUrl = rootUrl + '/auctions';

module.exports = (app: Express) => {
    app.route (baseUrl)
        .get (auctions.view)
        .post(authenticate.loginRequired, auctions.create);
    app.route(baseUrl + '/categories')
        .get(auctions.getCategories);
    app.route(baseUrl + '/:id')
        .get(auctions.getOne)
        .patch(authenticate.loginRequired, auctions.modify)
        .delete(authenticate.loginRequired, auctions.remove);

};