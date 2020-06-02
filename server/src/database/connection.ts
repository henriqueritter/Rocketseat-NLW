import knex from 'knex';
import path from 'path'; //para trabalhar com caminhos dos arquivos no node

const connection = knex({
  client: 'sqlite3',
  connection: {
    filename: path.resolve(__dirname, 'database.sqlite')
  }
})

export default connection;
