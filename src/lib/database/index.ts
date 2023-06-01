import postgres from 'postgres'
import * as dotenv from 'dotenv'
dotenv.config();

const sqlUrl = process.env.sql as string;

const sql = postgres(sqlUrl);

export default sql;