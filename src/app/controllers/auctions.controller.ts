import logger from "../../config/logger";
import {Request, Response} from "express";
import * as auctions from '../models/auctions.model';
import * as auctionBids from '../models/bids.model';
import * as images from '../models/images.model';
import Logger from "../../config/logger";
import * as tools from "../services/tools";


const view = async (req: Request, res: Response) : Promise<any> => {
    logger.info(`A.C get auctions`);
    logger.info(req.query);

    req.query = await tools.unstringifyObject(req.query);
    // make sure query is a string
    if (req.query.q) {
        req.query.q = `${req.query.q}`;
    }

    try {
        const auctionData = await auctions.search(req.query);
        const count = await auctions.getAuctionCount(req.query);
        res.status( 200 ).json(
            { count,
                "auctions" : auctionData});
    } catch( err ) {
        res.status( 500 )
            .send( `ERROR getting auctions ${ err }` );
    }
}


const create = async (req: Request, res: Response) : Promise<void> => {
    logger.info(`A.C Creating Auction with title ` + req.body.title );
    const endDate = new Date(req.body.endDate);
    const currentDate = new Date(Date.now());
    const reserve = parseInt(req.body.reserve, 10);
    if (!(endDate > currentDate)) {
        res.statusMessage = 'Bad Request: Auction End Date must be in the future';
        res.status(400).send();
    }
        try {
            if (req.body.categoryId) {
                logger.info(req.body.categoryId)
                const areValidCategories = await auctions.categoryExists(req.body.categoryId);
                if (areValidCategories === 0) {
                    res.statusMessage = `Bad Request: one or more invalid category IDs`;
                    res.status(400).send();
                    return;
                }
            }
        if (isNaN(reserve)) {
            req.body.reserve = 1;
        }
            const auctionId = await auctions.create(req.body.title, req.body.description, req.body.reserve, req.body.categoryId, req.body.endDate, req.body.authenticatedUserId);
            res.statusMessage = 'Created';
            res.status(201).json({"auctionId": Number(auctionId)});
        } catch (err) {
            if (err.sqlMessage && err.sqlMessage.includes('Duplicate entry')) {
                res.statusMessage = 'Bad Request: Auction with details already exists!';
                res.status(400).send();
            } else {
                if (!err.hasBeenLogged) logger.error(err);
                res.statusMessage = 'Internal Server Error';
                res.status(500).send();
            }
        }
}

const getOne = async (req: Request, res: Response) : Promise<void> => {
    try {
        const auction = await auctions.viewDetails(Number(req.params.id));
        logger.info(`A.C getting auction with id ${req.params.id}`);
        if (auction) {
            res.statusMessage = 'OK';
            res.status(200).json(auction);
        } else {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        }
    } catch (err) {
        if (!err.hasBeenLogged) Logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}

const remove = async (req: Request, res: Response) : Promise<any> => {
    const auctionId = parseInt(req.params.id, 10);
    const numBids = await auctionBids.getNumBids(auctionId);
    logger.info(`A.C Number of Bids: ` + Number(numBids));
    try {
        const auction = await auctions.viewDetails(Number(auctionId));
        if (Number(numBids) > 0) {
            res.statusMessage = 'Forbidden';
            res.status(403).send();
        }
        if (auction === null) {
            res.statusMessage = 'Event Not Found';
            res.status(404).send();

        } else if (!req.body.authenticatedUserId) {
            res.statusMessage = 'Forbidden';
            res.status(403).send();

        } else {
            const filename = await auctions.getAuctionImageFilename(Number(auctionId));
            await Promise.all([
                images.deleteImage(filename),
                auctions.remove(auctionId)
            ]);
            res.statusMessage = 'OK';
            res.status(200).send();
        }
    } catch (err) {
        if (!err.hasBeenLogged) logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}

const getCategories = async (req: Request, res: Response) : Promise<any> => {
    try {
        const categories = await auctions.getCategories();
        res.statusMessage = 'OK';
        res.status(200).json(categories);
    } catch (err) {
        if (!err.hasBeenLogged) logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}

const modify = async (req: Request, res: Response) : Promise<any> => {
    const auctionId = parseInt(req.params.id, 10);
    const sellerId = await auctions.getSellerId(auctionId);

    if (auctionId === null || sellerId === null) {
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
    }
    if (sellerId.toString() !== req.body.authenticatedUserId.toString()) {
        res.statusMessage = 'Forbidden';
        res.status(403).send();
    } else {
        try {
            await auctions.modify(auctionId, req.body.title, req.body.description, req.body.reserve, req.body.categoryId);
            res.statusMessage = 'OK';
            res.status(200).send();
        } catch (err) {
            if (!err.hasBeenLogged) logger.error(err);
            res.statusMessage = 'Internal Server Error';
            res.status(500).send();
        }
    }
}



export {view, create, getOne, modify, remove, getCategories}