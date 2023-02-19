const sql = require('msnodesqlv8');

async function koneksi (){
    
str = "Driver={SQL Server Native Client 10.0};Server=localhost;Database=bpr_angga;Trusted_Connection=yes;";
return str
}
// sql.open(connectionString, (err, conn) => {
//   if (err) {
//     console.error('Error connecting to SQL Server:', err);
//   } else {
//     console.log('Connected to SQL Server');
//     // Perform queries and other database operations here
//   }
// });


module.exports = {koneksi}