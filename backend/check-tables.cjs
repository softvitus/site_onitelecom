const { Sequelize } = require('sequelize');
const s = new Sequelize('site_oni_prod', 'postgres', 'Oni!@#456&*(', { 
  host: '177.223.51.10', 
  port: 5432, 
  dialect: 'postgres', 
  logging: false 
});

s.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
  .then(r => {
    console.log('Tabelas existentes:');
    r[0].forEach(t => console.log(' -', t.table_name));
    process.exit(0);
  })
  .catch(e => {
    console.log('ERRO:', e.message);
    process.exit(1);
  });
