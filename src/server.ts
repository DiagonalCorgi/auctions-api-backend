import { connect } from './config/db';
import express from './config/express';
import Logger from './config/logger'

const app = express();
const port = process.env.PORT || 4941;

// Connect to MySQL on start
async function main() {
    try {
        await connect();
        app.listen(port, () => {
            Logger.info('Listening on port: ' + port)
        });
    } catch (err) {
        Logger.error('Unable to connect to MySQL.')
        process.exit(1);
    }
}

main().catch(err => Logger.error(err));