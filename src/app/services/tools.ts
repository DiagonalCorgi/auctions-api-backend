import * as humps from 'humps';

export async function toCamelCase (object: any) {
    return humps.camelizeKeys(object);
}

export async function toUnderscoreCase (object: any) {
    return humps.decamelizeKeys(object);
}

export async function unstringifyObject (object: any) {
    const unstringified = {};
    for (const [key, value] of Object.entries(object)) {
        if (Array.isArray(value)) {
            // @ts-ignore
            unstringified[key.trim()] = value.map( el => {
                return isNumberString(el) ? parseFloat(el) :
                    isBooleanString(el) ? parseBoolean(el) :
                        el.trim();
            });
        } else {
            // @ts-ignore

            unstringified[key.trim()] =
                // @ts-ignore
                await isNumberString(value) ? parseFloat(value) :
                    // @ts-ignore
                    await isBooleanString(value) ? parseBoolean(value) :
                        // @ts-ignore
                        value.trim();
        }
    }
    return unstringified;
}

export async function equalNumbers(n1: any , n2: any) {
    if (await isNumberString(n1)) n1 = parseFloat(n1);
    if (await isNumberString(n2)) n2 = parseFloat(n2);
    return n1 === n2;
}

export async function  isNumberString (str: string) {
    if (typeof str !== 'string') return false;
    return !isNaN(Number(str)) && !isNaN(parseFloat(str))
}

export async function isBooleanString(str: string) {
    if (typeof str !== 'string') return false;
    return str.toLowerCase() === 'true' || str.toLowerCase() === 'false';
}

export async function parseBoolean(str: string) {
    switch (str.toLowerCase()) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            throw Error('Given string does not hold a boolean value.');
    }
}

// Convert between mimetypes/file extensions

export function getImageMimetype (filename: string) {
    if (filename.endsWith('.jpeg') || filename.endsWith('.jpg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.gif')) return 'image/gif';
    return 'application/octet-stream';
};

export function getImageExtension (mimeType: any) {
    switch (mimeType) {
        case 'image/jpeg':
            return '.jpeg';
        case 'image/png':
            return '.png';
        case 'image/gif':
            return '.gif';
        default:
            return null;
    }
};

export function isInThePast (date: string | number) {
    if (date === null) return false;
    if (typeof date === 'string') {
        date = Date.parse(date);
    }
    return date < Date.now();
};
