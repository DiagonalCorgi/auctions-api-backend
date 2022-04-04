export async function logSqlError (err: any) {
    // tslint:disable-next-line:no-console
    console.error(`An error occurred when executing: \n${err.sql} \nERROR: ${err.sqlMessage}`);
    err.hasBeenLogged = true;
}