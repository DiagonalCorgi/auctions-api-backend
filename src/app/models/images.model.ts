import logger from "../../config/logger";

import * as errors from '../services/errors';
import * as tools from '../services/tools';
import {fs} from 'mz';
import * as randtoken from 'rand-token';

const imagesDirectory = './storage/images/';

const retrieveImage = async (filename : any) => {
    logger.info("I.M retrieving image with filename" + filename);
    try {
        if (await fs.exists(imagesDirectory + filename)) {
            const image = await fs.readFile(imagesDirectory + filename);
            const mimeType = tools.getImageMimetype(filename);
            return {image, mimeType};
        } else {
            return null;
        }
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};

const storeImage = async (image: any, fileExt : any) => {
    logger.info(`I.M storing image with file extension ${fileExt} to images directory ${imagesDirectory}`);
    const filename = randtoken.generate(32) + fileExt;
    try {
        await fs.writeFile(imagesDirectory + filename, image);
        return filename;
    } catch (err) {
        logger.error(err);
        fs.unlink(imagesDirectory + filename).catch((err: any) => logger.error(err));
        throw err;
    }
};


const deleteImage = async (filename : any) => {
    logger.info("I.M deleting image with filename" + filename);
    try {
        if (await fs.exists(imagesDirectory + filename)) {
            await fs.unlink(imagesDirectory + filename);
        }
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};

export {retrieveImage, storeImage, deleteImage}