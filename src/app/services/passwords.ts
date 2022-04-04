import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;


export async  function hash (password: string) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

// tslint:disable-next-line:no-shadowed-variable
export async function compare(data: string | Buffer, hash: string) {
    return await bcrypt.compare(data, hash);
}