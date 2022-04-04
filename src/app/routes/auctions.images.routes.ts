import {Express} from "express";
import {rootUrl} from "./base.routes"
import * as authenticate from "../middleware/authenticate";
import * as auctionsImages from '../controllers/auctions.images.controller';

module.exports = (app: Express) => {
    app.route (rootUrl + '/auctions/:id/image')
        .get(auctionsImages.getAuctionImage)
        .put(authenticate.loginRequired, auctionsImages.setAuctionImage);
};