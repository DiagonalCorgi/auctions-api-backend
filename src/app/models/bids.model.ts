import * as db from '../../config/db';
import * as errors from '../services/errors';
import * as tools from '../services/tools';
import logger from "../../config/logger";
import {getPool} from "../../config/db";

const viewBids = async (auctionId : number) => {
    logger.info("B.M Getting bids for Auction bids from Auction" + auctionId);
    const query = `SELECT user_id as bidderId,
       amount,
       U.first_name as firstName,
       U.last_name as lastName,
       timestamp
       FROM \`auction_bid\`A
        LEFT JOIN \`user\` U on A.user_id = U.id
        WHERE auction_id = ?
        ORDER BY amount DESC`;
    const values = [auctionId];

        try {
            const [result] = await db.getPool().query(query, values);
            const rows = result;
            return tools.toCamelCase(rows);
        }  catch (err) {
            await errors.logSqlError(err);
            throw err;
        }
}

const getNumBids = async (auctionId: number) => {
    logger.info("B.M Getting count for Auction bids from Auction" + auctionId);
    try {
        const conn = await getPool().getConnection();
        const query = `select COUNT(*) as count from \`auction_bid\` WHERE auction_id=?`;
        const [rows]  = await conn.query( query, [auctionId] );
        conn.release();
        return rows[0].count;
    }
    catch (err) {
        await errors.logSqlError(err);
        return null;
    }
}

const addBid = async (auctionId : number, bidderId : number, amount : number) => {
    logger.info("B.M adding bid by user id " + bidderId + " to Auction: " + auctionId);
    const insertSQL = `INSERT INTO \`auction_bid\`
(
    user_id,
    auction_id,
    timestamp,
    amount
                       )
                       VALUES (?, ?, ?, ?)`;

    const bidderData = [
        bidderId,
        auctionId,
        new Date(),
        amount
    ];
    try {
        await db.getPool().query(insertSQL, bidderData);
    } catch (err) {
        await errors.logSqlError(err);
        throw err;
    }
}



export {viewBids, addBid, getNumBids}