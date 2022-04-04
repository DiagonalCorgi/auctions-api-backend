import Ajv from 'ajv';
import * as swaggerApi from '../resources/seng365_auction_site_api_spec.json';
import logger from "../../config/logger";

const swagger = swaggerApi;

const ajv = new Ajv({ removeAdditional: 'all' });

// ajv.addSchema(swagger, 'swagger');
// ajv.addFormat('password', /.*/);
// ajv.addFormat('binary', /.*/);



const checkAgainstSchema = async (schemaPath: any, data: any, requireNotEmpty = true) =>{
    const schemaRef = 'swagger#/' + schemaPath;
    ajv.addSchema(swagger, 'swagger');
    ajv.addFormat('password', /.*/);
    ajv.addFormat('binary', /.*/);
    logger.info(swagger);
    try {
        if (ajv.validate({ $ref: schemaRef }, data)) {
            if (requireNotEmpty && Object.keys(data).length === 0)
                return 'no valid fields provided';
            else {
                return true;
            }
        } else {
            return ajv.errorsText();
        }
    } catch (err) {
        return err.message;
    }
}

export {checkAgainstSchema}




