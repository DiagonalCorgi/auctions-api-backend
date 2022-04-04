import * as bids from '../controllers/auctions.bids.controller';
import * as authenticate from '../middleware/authenticate';
import {Express} from "express";
import {rootUrl} from "./base.routes";

module.exports = (app: Express) => {
    app.route (rootUrl + '/auctions/:id/bids')
        .get(bids.getBids)
        .post(authenticate.loginRequired, bids.addBid);
};