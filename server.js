const express = require("express");
const path = require("path");
const mysql = require("mysql")
const PORT = process.env.PORT || 3000;
const server = express();
const session = require("express-session");
const bodyParser = require("body-parser");

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql7.freesqldatabase.com',
    user: 'sql7775750',
    password: 'ktzaxJU9L6',
    database: 'sql7775750'
});

server.use(express.urlencoded({ extended: true }));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(express.json());
server.use(session({
    secret: 'UKMskrivnostShhh', 
    resave: false,
    saveUninitialized: true
}))

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,"Public","login.html"));
});

server.use(express.static(("Public")));

server.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let result = await SQLquery(`SELECT * FROM tablogin WHERE Username = '${username}' AND Password = '${password}'`);
    if(result.length > 0){
        req.session.Username = username;
        req.session.ID = result[0].OznakaSkrbnika;
        req.session.Admin = result[0].Admin;
        res.redirect('/Index.html');
    }else{
        res.redirect('/login.html');
    }
});

server.post('/Odjava', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            console.log(err);
            res.status(500).send("Napaka pri odjavi.");
        }else{
            res.redirect('/login.html');
        }
    });
});

server.post('/user', (req, res) => {
    res.send({"username": req.session.Username, "ID": req.session.ID, "Admin": req.session.Admin});
})

server.post('/analitikaUstanove', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, Ustanova FROM tabnamestitev GROUP BY Ustanova ORDER BY Stevilo ASC");
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

server.post('/analitikaSpol', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, Spol FROM tabnamestitev GROUP BY Spol");
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
    let result;
    try{
    let vnos = req.body;
    try{
        if(vnos.StopnjaStudija == ""){
            result = await SQLquery(`INSERT INTO tabnamestitev(Ime,Priimek,Spol,ElektronskaPosta,Ustanova,NazivOS,NazivEndNoteVerzije,StatusUporabnika,ClanicaNamestitve,StopnjaStudijskegaPrograma,OznakaSkrbnika,DatumNamestitve,DatumSpremembe) VALUES("${vnos.Ime}","${vnos.Priimek}","${vnos.Spol}","${vnos.email}","${vnos.Ustanova}","${vnos.OS}","${vnos.EndNoteV}","${vnos.StatusUporabnika}",'UKM',NULL,"${vnos.username}","${vnos.Datum}","${vnos.Datum}")`);
        }else{
            result = await SQLquery(`INSERT INTO tabnamestitev(Ime,Priimek,Spol,ElektronskaPosta,Ustanova,NazivOS,NazivEndNoteVerzije,StatusUporabnika,ClanicaNamestitve,StopnjaStudijskegaPrograma,OznakaSkrbnika,DatumNamestitve,DatumSpremembe) VALUES("${vnos.Ime}","${vnos.Priimek}","${vnos.Spol}","${vnos.email}","${vnos.Ustanova}","${vnos.OS}","${vnos.EndNoteV}","${vnos.StatusUporabnika}",'UKM',"${vnos.StopnjaStudija}","${vnos.username}","${vnos.Datum}","${vnos.Datum}")`);
        }
        
        res.send(result);
        res.status(200);
    }catch(err){
        res.send(result);
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
        SQLquery(`DELETE FROM tabnamestitev WHERE IdNamestitve = '${Id}';`)
        res.status(200).json({ success: true });
    }catch(err){
        res.status(500).json({ success: false });
    }
});

server.post('/pridobiVnos', async (req, res) => {
    try{
        let id = req.body.ID
        let result = await SQLquery(`SELECT * FROM tabnamestitev WHERE IdNamestitve = '${id}'`);
        res.send(result);
    }catch(err){
        console.log(err);
    }
});

server.post('/spremeniVnos', async (req, res) => {
    try{
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
server.post('/Uporabnik', async (req, res) => {
    try{
        let result = await SQLquery("SELECT * FROM tablogin");
        res.send(result);
    }catch{
        console.log(err);
        res.status(500);
    }
});

server.post('/IzbrisSifranta', async (req, res) => {
    let id = req.body.ID;
    
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