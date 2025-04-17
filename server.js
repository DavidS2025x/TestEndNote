const express = require("express");
const path = require("path");
const mysql = require("mysql")
const PORT = process.env.PORT || 3000;
const server = express();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql7.freesqldatabase.com',
    user: 'sql7772553',
    password: 'FfNiQnPPnW',
    database: 'sql7772553'
});

server.use(express.urlencoded({ extended: true }));
server.use(express.json());

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"Public","Index.html"));
});

server.use(express.static(("Public")));

server.post('/analitikaUstanove', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, Ustanova FROM tabnamestitev GROUP BY Ustanova")
        res.send(result);
    } catch (err){
        console.log(err);
        res.status(500);
    }
});

server.post('/analitikaOS', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, NazivOS FROM tabnamestitev GROUP BY NazivOS");
        res.send(result);
    } catch (err){
        console.log(err);
        res.status(500);
    }
});

server.post('/analitikaNamestitve', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, NazivEndNoteVerzije FROM tabnamestitev GROUP BY NazivEndNoteVerzije");
        res.send(result);
    } catch (err){
        console.log(err);
        res.status(500);
    }
});

server.post('/StNamestitev', async (req, res) => {
    try{
        let result = await SQLquery("select COUNT(*) AS Stevilo FROM tabnamestitev");
        res.send(result);
    } catch (err){
        console.log(err);
        res.status(500);
    }
});

server.post('/Analitika', async (req, res) => {
    try{
        let result = await SQLquery("SELECT IdNamestitve AS '#', Ime, Priimek, Spol, Ustanova, StatusUporabnika AS Status FROM tabnamestitev ORDER BY Priimek, Ime");
        res.send(result);
    } catch (err){
        console.log(err)
        res.status(500);
    }
});

server.post('/Vnos', async (req, res) => {
    try{
    let vnos = req.body;
    try{
        if(vnos.StopnjaStudija == ""){
            let result = await SQLquery(`INSERT INTO tabnamestitev(Ime,Priimek,Spol,ElektronskaPosta,Ustanova,NazivOS,NazivEndNoteVerzije,StatusUporabnika,ClanicaNamestitve,StopnjaStudijskegaPrograma,OznakaSkrbnika,DatumNamestitve,DatumSpremembe) VALUES("${vnos.Ime}","${vnos.Priimek}","${vnos.Spol}","${vnos.email}","${vnos.Ustanova}","${vnos.OS}","${vnos.EndNoteV}","${vnos.StatusUporabnika}",'UKM',NULL,"${vnos.username}","${vnos.Datum}","${vnos.Datum}")`);
        }else{
            let result = await SQLquery(`INSERT INTO tabnamestitev(Ime,Priimek,Spol,ElektronskaPosta,Ustanova,NazivOS,NazivEndNoteVerzije,StatusUporabnika,ClanicaNamestitve,StopnjaStudijskegaPrograma,OznakaSkrbnika,DatumNamestitve,DatumSpremembe) VALUES("${vnos.Ime}","${vnos.Priimek}","${vnos.Spol}","${vnos.email}","${vnos.Ustanova}","${vnos.OS}","${vnos.EndNoteV}","${vnos.StatusUporabnika}",'UKM',"${vnos.StopnjaStudija}","${vnos.username}","${vnos.Datum}","${vnos.Datum}")`);
        }
        
        res.status(200);
    }catch(err){
        res.status(500)
    }
    res.status(200);
    } catch (err){
        console.log(err)
        res.status(500);
    }
});

server.post('/Izbris', async (req, res) => {
    try{
        let Id = req.body.ID;
        console.log(Id);
        SQLquery(`DELETE FROM tabnamestitev WHERE IdNamestitve = '${Id}';`)
        res.status(200).json({ success: true });
    }catch(err){
        console.log(err)
        res.status(500).json({ success: false });
    }
});

server.post('/pridobiVnos', async (req, res) => {
    try{
        let id = req.body.ID
        console.log(id)
        let result = await SQLquery(`SELECT * FROM tabnamestitev WHERE IdNamestitve = '${id}'`);
        res.send(result);
    }catch(err){
        console.log(err);
    }
});

server.post('/spremeniVnos', async (req, res) => {
    try{
        console.log(req.body.Ime);
        let result;
        if(req.body.StopnjaStudija == ""){
            result = await SQLquery(`UPDATE tabnamestitev SET Ime = '${req.body.Ime}', Priimek = '${req.body.Priimek}', Spol = '${req.body.Spol}', ElektronskaPosta = '${req.body.email}', Ustanova = '${req.body.Ustanova}', NazivOS = '${req.body.OS}', NazivEndNoteVerzije = '${req.body.EndNoteV}', StatusUporabnika = '${req.body.StatusUporabnika}', ClanicaNamestitve = 'UKM', StopnjaStudijskegaPrograma = NULL, OznakaSkrbnika = '${req.body.username}', DatumSpremembe = '${req.body.Datum}' WHERE IdNamestitve = '${req.body.ID}'`)
        }else{
            result = await SQLquery(`UPDATE tabnamestitev SET Ime = '${req.body.Ime}', Priimek = '${req.body.Priimek}', Spol = '${req.body.Spol}', ElektronskaPosta = '${req.body.email}', Ustanova = '${req.body.Ustanova}', NazivOS = '${req.body.OS}', NazivEndNoteVerzije = '${req.body.EndNoteV}', StatusUporabnika = '${req.body.StatusUporabnika}', ClanicaNamestitve = 'UKM', StopnjaStudijskegaPrograma = '${req.body.StopnjaStudija}', OznakaSkrbnika = '${req.body.username}', DatumSpremembe = '${req.body.Datum}' WHERE IdNamestitve = '${req.body.ID}'`)
        }
        res.send(result);
    }catch(err){
        console.log(err);
    }
});

//Za generacijo options v obrazcu
server.post('/Status', async (req, res) => {
    try{
        let result = await SQLquery("SELECT * FROM tabstatusuporabnika");
        res.send(result);
    }catch(err){
        console.log(err);
        res.status(500);
    }
});
server.post('/Stopnja', async (req, res) => {
    try{
        let result = await SQLquery("SELECT * FROM tabstudijskiprogram");
        res.send(result);
    }catch{
        console.log(err);
        res.status(500);
    }
});
server.post('/EndNote', async (req, res) => {
    try{
        let result = await SQLquery("SELECT * FROM tabendnote");
        res.send(result);
    }catch{
        console.log(err);
        res.status(500);
    }
});
server.post('/OS', async (req, res) => {
    try{
        let result = await SQLquery("SELECT * FROM tabos");
        res.send(result);
    }catch{
        console.log(err);
        res.status(500);
    }
});
server.post('/Ustanova', async (req, res) => {
    try{
        let result = await SQLquery("SELECT * FROM tabustanove");
        res.send(result);
    }catch{
        console.log(err);
        res.status(500);
    }
});


server.listen(PORT, () => {
    console.log(`Server listening at Localhost:${PORT}`);
});

function SQLquery(SQLquery) {
    return new Promise((resolve, reject) => {
        pool.query(SQLquery, (err, results) => {
            if (err){
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}