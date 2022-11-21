import pool from '../db'


const createDB = async () => {
  try {

    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    await pool.query('CREATE TABLE IF NOT EXISTS accounts (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), balance MONEY NOT NULL);')
    await pool.query('CREATE TABLE IF NOT EXISTS users (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, accountId uuid REFERENCES accounts(id));')
    await pool.query('CREATE TABLE IF NOT EXISTS transactions(id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), debitedAccountId uuid REFERENCES accounts(id) NOT NULL, creditedAccountId uuid REFERENCES accounts(id) NOT NULL, value MONEY NOT NULL, createdAt TIMESTAMP DEFAULT current_timestamp);')
    await pool.query("CREATE OR REPLACE FUNCTION disallow_overflow() RETURNS trigger AS $$ BEGIN if(NEW.balance::numeric < 0) then raise exception 'Invalid update.' using hint = 'Tentativa de transferência em valor maior que o saldo atual.'; end if; RETURN NEW; END $$ LANGUAGE plpgsql;")
    await pool.query('CREATE OR REPLACE TRIGGER tr_disallow_overflow BEFORE UPDATE OF balance ON accounts FOR EACH ROW EXECUTE PROCEDURE disallow_overflow();')

    process.exit(0)

  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}

createDB()
