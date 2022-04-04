import {Request, Response} from "express";
import * as auctions from '../models/auctions.model';
import * as bids from '../models/bids.model';
import logger from "../../config/logger";
import * as auctionBids from "../models/bids.model";

const addBid = async (req: Request, res: Response) : Promise<void> => {
    const auctionId = parseInt(req.params.id, 10);
    const bidderId = req.body.authenticatedUserId;
    const sellerId = await auctions.getSellerId(auctionId);
    logger.info(`A.B.C seller Id is: ` + sellerId);

    try {
        const auction = await auctions.viewDetails(auctionId);
        if (auction === null) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else if (Number(bidderId) === Number(sellerId)) {
            res.statusMessage = 'Forbidden';
            res.status(403).send();
        } else {
                await bids.addBid(auctionId, bidderId, req.body.amount);
                res.statusMessage = 'Created';
                res.status(201).json();
        }
    } catch (err) {
        if (!err.hasBeenLogged) logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}

const getBids = async (req: Request, res: Response) : Promise<any> => {
    const auctionId = parseInt(req.params.id, 10);
    const numBids = await auctionBids.getNumBids(auctionId);
    logger.info(`A.B.C Number of Bids: ` + numBids.toString());

    try {
        const auction = await auctions.viewDetails(auctionId);
        if (auction === null || auctionId > 50) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const bidders = await bids.viewBids(auctionId);
            res.statusMessage = 'OK';
            res.status(200).json(bidders);
        }
    } catch (err) {
        if (!err.hasBeenLogged) logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}


export {addBid, getBids};
