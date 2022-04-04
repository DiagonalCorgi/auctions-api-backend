import * as users from '../models/users.model';
import * as images from '../models/images.model';
import * as tools from '../services/tools';
import {Request, Response} from "express";
import logger from "../../config/logger";

const getProfileImage = async (req: Request, res: Response) : Promise<void> => {
    const userId = parseInt(req.params.id, 10);
    const checkId = await users.findById(userId);
    if (checkId == null) {
        res.statusMessage = 'Not Found';
        res.status(404).send();
    }
    try {
        const image = await users.getProfileImageFilename(userId);
        if (image.imageFilename == null) {
            res.statusMessage = 'Not Found';
            res.status(404).send();
        } else {
            const imageDetails = await images.retrieveImage(image.imageFilename);
            logger.info(`U.I.C image details is ${imageDetails}`);
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

const setProfileImage = async (req: Request, res: Response) : Promise<any> => {
    const image = req.body;
    const userId = parseInt(req.params.id, 10);
    logger.info(`U.I.C setting user ${userId} with profile image ${req.body.authenticatedUserId}`);
    const user = await users.findById(userId);
    if (!user) {
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
    }

    // Check that the authenticated user isn't trying to change anyone else's image
    if (userId.toString() !== req.body.authenticatedUserId) {
        res.statusMessage = 'Forbidden';
        res.status(403).send();
        return;
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
        const existingImage = await users.getProfileImageFilename(userId);
        if (existingImage) {
            await images.deleteImage(existingImage);
        }
        const filename = await images.storeImage(image, fileExt);
        await users.setProfileImageFilename(userId, filename);
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

const deleteProfileImage = async (req: Request, res: Response) : Promise<any> => {
    const userId = parseInt(req.params.id, 10);

    const user = await users.findById(userId);
    if (!user) {
        res.statusMessage = 'Not Found';
        res.status(404).send();
        return;
    }

    logger.info(`U.I.C User ID check: ` + userId +`, logged in: `+ req.body.authenticatedUserId);
    // Check that the authenticated user isn't trying to delete anyone else's image
    if (userId.toString() !== req.body.authenticatedUserId.toString()) {
        res.statusMessage = 'Forbidden';
        res.status(403).send();
    } else {
        try {
            const imageFilename = await users.getProfileImageFilename(userId);
            if (imageFilename == null) {
                res.statusMessage = 'Not Found';
                res.status(404).send();
            } else {
                await Promise.all([
                    images.deleteImage(imageFilename),
                    users.setProfileImageFilename(userId, null)
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
}

export {getProfileImage, setProfileImage, deleteProfileImage}
