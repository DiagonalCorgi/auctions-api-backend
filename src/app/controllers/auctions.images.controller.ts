import * as auctions from '../models/auctions.model';
import * as images from '../models/images.model';
import * as tools from '../services/tools';
import {Request, Response} from "express";
import logger from "../../config/logger";

const getAuctionImage = async (req: Request, res: Response) : Promise<void> => {
    const auctionId = parseInt(req.params.id, 10);
    const checkId = await auctions.findById(auctionId);
    if (checkId == null) {
        res.statusMessage = 'Not Found';
        res.status(404).send();
    }
    try {
        const image = await auctions.getAuctionImageFilename(auctionId);
        if (image.imageFilename == null) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const imageDetails = await images.retrieveImage(image.imageFilename);
            logger.info(`A.I.C image details is ${imageDetails}`);
            if (imageDetails === null) {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            } else {
                res.statusMessage = 'OK';
                res.status(200).contentType(await imageDetails.mimeType).send(imageDetails.image);
            }
        }
    } catch (err) {
        if (!err.hasBeenLogged) logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}

const setAuctionImage = async (req: Request, res: Response) : Promise<any> => {
    const image = req.body;
    const auctionId = parseInt(req.params.id, 10);
    const sellerId = await auctions.getSellerId(auctionId);
    logger.info(`A.I.C setting auction ${auctionId} with auction image ${req.body}`);

    const auction = await auctions.findById(auctionId);
    if (!auction) {
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
    }

    // Check that the authenticated user isn't trying to change anyone else's image
    if (Number(req.body.authenticatedUserId) !== Number(sellerId)) {
        res.statusMessage = 'Forbidden';
        res.status(403).send();
    }

    // Find the file extension for this image
    const mimeType = req.header('Content-Type');
    const fileExt = tools.getImageExtension(mimeType);
    if (fileExt === null) {
        res.statusMessage = 'Bad Request: image must be image/jpeg, image/png, image/gif type, but it was: ' + mimeType;
        res.status(400).send();
        return;
    }
    if (req.body.length === undefined) {
        res.statusMessage = 'Bad request: empty image';
        res.status(400).send();
        return;
    }

    try {
        const existingImage = await auctions.getAuctionImageFilename(auctionId);
        if (existingImage) {
            await images.deleteImage(existingImage);
        }
        const filename = await images.storeImage(image, fileExt);
        await auctions.setAuctionImageFilename(auctionId, filename);
        if (!existingImage === null) {
            res.statusMessage = 'OK';
            res.status(200).send();
        } else {
            res.statusMessage = 'Created';
            res.status(201).send();
        }
    } catch (err) {
        if (!err.hasBeenLogged) logger.error(err);
        res.statusMessage = 'Internal Server Error';
        res.status(500).send();
    }
}



export {getAuctionImage, setAuctionImage}
