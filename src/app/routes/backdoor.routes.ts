import {Express} from "express";
import {rootUrl} from "./base.routes"

import * as backdoor from '../controllers/backdoor.controller';

module.exports = (app: Express) => {
    app.route(rootUrl + '/reset')
        .post(backdoor.resetDb);

    app.route(rootUrl + '/resample')
        .post(backdoor.resample);

    app.route(rootUrl + '/reload')
        .post(backdoor.reload);

    app.route(rootUrl + '/executeSql')
        .post(backdoor.executeSql);
};
