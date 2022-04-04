import * as db from '../../config/db';
import * as errors from "../services/errors";
import * as tools from "../services/tools";
import logger from "../../config/logger";
import {ResultSetHeader} from "mysql2";



export async function getSellerId(auctionId: number) {
    const viewSQL = `select seller_id from \`auction\` where id = ? `;
    try {
        const result = await db.getPool().query(viewSQL, auctionId);
        const rows = result[0];
        if (rows.length < 1) {
            return null;
        } else {
            const userData = Object.values(rows[0]);
            return userData;
        }
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
}

const findById = async (auctionId: number) : Promise<any> => {
    const viewSQL = 'SELECT * FROM `auction` WHERE `id` = ?';

    try {
        const result = await db.getPool().query(viewSQL, auctionId);
        const rows = result[0];
        if (rows.length < 1) {
            return null;
        } else {
            return [auctionId];
        }
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
};


const getAuctionCount = async (query: any) : Promise<any> => {
    const values = [];
    logger.info("A.M Getting count for Auctions: "
        + query.startIndex
        + query.count
        + query.q
        + query.categoryIds
        + query.sellerId
        + query.bidderId
        + query.sortBy
    );
    let SQLQuery = `select COUNT(DISTINCT A.id) as count
                    from \`auction\` A
                        LEFT JOIN \`user\` U
                    on U.id = A.seller_id `;
    const aConditions = [];
    if (query.hasOwnProperty("bidderId")) {
        SQLQuery += 'LEFT JOIN \`auction_bid\` B ON B.auction_id = A.id '
        aConditions.push(' B.user_id = ?');
        values.push(parseInt(query.bidderId, 10));
    }
    if (query.hasOwnProperty("q")) {
        aConditions.push('(\`title\` LIKE ? OR \`description\` LIKE ?)');
        values.push(`%${query.q}%`);
        values.push(`%${query.q}%`);
    }
    if (query.hasOwnProperty("sellerId")) {
        aConditions.push('seller_id = ?');
        values.push(query.sellerId);
    }
    if (query.hasOwnProperty("categoryIds")) {
        aConditions.push('category_id = ?')
        values.push((parseInt(query.categoryIds, 10)));
    }
    if (aConditions.length) {
        SQLQuery += `WHERE ${(aConditions ? aConditions.join(' AND ') : 1)}\n`;
    }
    if(typeof query.categoryId !== "undefined") {
        SQLQuery += 'LIMIT ?\n';
        values.push(parseInt(query.categoryId, 10));
    }
    // LIMIT and OFFSET
    if (typeof query.count !== 'undefined') {
        SQLQuery += 'LIMIT ?\n';
        values.push(query.count);
    }
    if (typeof query.startIndex !== 'undefined') {
        if (typeof query.count === 'undefined') {
            SQLQuery += 'LIMIT ?\n';
            values.push(1000000000);
        }
        SQLQuery += 'OFFSET ?\n';
        values.push(parseInt(query.startIndex, 10));
    }

    try {
        const [result] = await db.getPool().query(SQLQuery, values);
        return (result[0].count);
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}



const search = async (query: any) : Promise<any> => {
    const values = [];
    let aSearchSQL =`select DISTINCT A.id                                                              as auctionId,
                            title,
                            reserve,
                            seller_id                                                         as sellerId,
                            category_id                                                       as categoryId,
                            U.first_name                                                      as sellerFirstName,
                            U.last_name                                                       as sellerLastName,
                            end_date                                                          as endDate,
                            (SELECT COUNT(*) FROM \`auction_bid\` WHERE auction_id = A.id)    as numBids,
                            (SELECT MAX(amount) FROM \`auction_bid\` WHERE auction_id = A.id) as highestBid
                     from \`auction\` A
            LEFT JOIN \`user\` U on U.id = A.seller_id `;

    const aConditions = [];
    if (query.hasOwnProperty("bidderId")) {
        aSearchSQL += 'RIGHT JOIN \`auction_bid\` B ON B.auction_id = A.id '
        aConditions.push('B.user_id = ?');
        values.push(parseInt(query.bidderId, 10));
    }
    if (query.hasOwnProperty("q")) {
        aConditions.push('(\`title\` LIKE ? OR \`description\` LIKE ?)');
        values.push(`%${query.q}%`);
        values.push(`%${query.q}%`);
    }
    if (query.hasOwnProperty("sellerId")) {
        aConditions.push('seller_id = ?');
        values.push(query.sellerId);
    }
    if (query.hasOwnProperty("categoryIds")) {
        aConditions.push('category_id = ?')
        values.push(query.categoryIds);
    }
    if (aConditions.length) {
        aSearchSQL += `WHERE ${(aConditions ? aConditions.join(' AND ') : 1)}\n`;
    }
    // ORDER BY
    switch (query.sortBy) {
        case 'ALPHABETICAL_ASC':
            aSearchSQL += `ORDER BY title ASC`;
            break;
        case 'ALPHABETICAL_DESC':
            aSearchSQL += `ORDER BY title DESC`;
            break;
        case 'BIDS_ASC':
            aSearchSQL += `ORDER BY bids ASC`;
            break;
        case 'BIDS_DESC':
            aSearchSQL += `ORDER BY bids DESC`;
            break;
        case 'RESERVE_DESC':
            aSearchSQL += `ORDER BY \`reserve\` DESC`;
            break;
        case 'CLOSING_LAST':
            aSearchSQL += `ORDER BY end_date DESC`;
            break;
        case 'RESERVE_ASC':
            aSearchSQL += `ORDER BY \`reserve\` ASC`;
            break;
        case ' CLOSING_SOON':
        default:
            aSearchSQL += `ORDER BY end_date ASC`;
            break;
    }
    aSearchSQL += ', auctionId\n';
    if(typeof query.categoryId !== "undefined") {
        aSearchSQL += 'LIMIT ?\n';
        values.push(parseInt(query.categoryId, 10));
    }
    // LIMIT and OFFSET
    if (typeof query.count !== 'undefined') {
        aSearchSQL += 'LIMIT ?\n';
        values.push(parseInt(query.count, 10));
    }
    if (typeof query.startIndex !== 'undefined') {
        if (typeof query.count === 'undefined') {
            aSearchSQL += 'LIMIT ?\n';
            values.push(1000000000);
        }
        aSearchSQL += 'OFFSET ?\n';
        values.push(parseInt(query.startIndex, 10));
    }

    try {
        const [result] = await db.getPool().query(aSearchSQL, values);
            return (result);
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};




const create = async (title: string, description: string, categoryId: string, endDate: string, reserve: number, userId: number) : Promise<ResultSetHeader> => {
    logger.info(`A.M create auction ${title} by user id: ${userId}`);
    const query = `INSERT INTO \`auction\`
    ( title, description, end_date, reserve, category_id, seller_id )
    VALUES ( ?, ?, ?, ?, ?, ?)`;
    const auctionData = [title, description, reserve, categoryId, endDate, userId ]
    try {
        const result  = await db.getPool().query(query, auctionData );
        logger.info(`Created auction with ID: ${result.insertId} and seller id: ${userId}`);
        return result[0].insertId;
    }  catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};

const modify = async (auctionId: number, title : string, description : string, reserve : number, categoryId: number) : Promise<any> => {
    logger.info(`A.M modify auction ${auctionId}`);
    const updateSQL = 'UPDATE `auction` SET title=?, description=?, reserve=?, category_id=? WHERE `id` = ?';

    try {
        await db.getPool().query(updateSQL, [title, description, reserve, categoryId, auctionId]);
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};

const remove = async  (auctionId : any) => {
    logger.info(`A.M delete auction ${auctionId}`);
    const query = `DELETE FROM auction WHERE id = ?`;
    try {
        const result = await db.getPool().query(query, [auctionId]);
        if (result[0].affectedRows !== 1) {
            throw Error(`Should be exactly one petition that was deleted, but it was ${result[0].changedRows}.`);
        }
    }
    catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};

const viewDetails = async (auctionId : number)  => {
    logger.info(`A.M view auction ${auctionId}`);
    const query = `SELECT A.id as auctionId,
    title,
    description,
    category_id,
    U.id as seller_id,
    U.first_name as sellerFirstName,
    U.last_name as sellerLastName,
    reserve,
    (SELECT COUNT(*) FROM \`auction_bid\` WHERE auction_id = A.id)    as numBids,
    (SELECT MAX(amount) FROM \`auction_bid\` WHERE auction_id = A.id) as highestBid,
    end_date
    FROM auction A
    LEFT JOIN user U on U.id = A.seller_id
    WHERE A.id = ?`;
    try {
        const result = await db.getPool().query(query, [auctionId]);
        const rows = result[0];
        return tools.toCamelCase(rows[0]);
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
};


const getAuctionImageFilename = async (auctionId: number) : Promise<any> => {
    logger.info(`U.M getting auction image for auction ${auctionId}`);
    const selectSQL = 'SELECT `image_filename` FROM auction WHERE `id` = ?';
    try {
        const result = await db.getPool().query(selectSQL, [auctionId]);
        const rows = result[0];
        logger.info(rows);
        if (rows.length) {
            return tools.toCamelCase(rows[0]);
        }
    } catch (err) {
        await errors.logSqlError(err);
        return null;
    }
}

const setAuctionImageFilename = async (auctionId: number, imageFilename : any) => {
    logger.info(`U.M set profile image for user ${auctionId} file ${imageFilename}`);
    const updateSQL = 'UPDATE `auction` SET `image_filename` = ? WHERE `id` = ?';

    try {
        const result = await db.getPool().query(updateSQL, [imageFilename, auctionId]);
        if (result[0].changedRows !== 1) {
            throw Error('Should be exactly one auction whose auction image was modified.');
        }
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}

const getCategories = async () : Promise<any> => {
    logger.info(`A.M get categories`);
    const selectSQL = `SELECT id, name
                       FROM \`category\``;

    try {
        const result = await db.getPool().query(selectSQL);
        const categories = result[0];
        return categories;
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}

const categoryExists = async (categoryIds: any) => {
    const selectSql = `SELECT count(*) AS c
                       FROM \`category\`
                       WHERE id IN (?)`;

    try {
        const result = await db.getPool().query(selectSql, [categoryIds]);
        logger.info("A.M categories: " + result[0][0].c);
        return result[0][0].c;
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}




export {getAuctionCount, findById, search, create, modify, remove, viewDetails, getAuctionImageFilename, setAuctionImageFilename, getCategories, categoryExists}