const express = require("express");
const path = require("path");
const mysql = require("mysql")
const PORT = process.env.PORT || 3000;
const server = express();
const session = require("express-session");
const bodyParser = require("body-parser");
const e = require("express");


/*const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'sql7.freesqldatabase.com',
    user: 'sql7775750',
    password: 'ktzaxJU9L6',
    database: 'sql7775750'
});
*/

/*
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'LocalHost',
    user: 'Admin',
    password: 'AdminRoot2025!',
    database: 'endnotenamestitve'
});
*/

const pool = mysql.createPool({
    connectionLimit: 10,
    host: '164.8.88.60',
    user: 'enn',
    password: '!EndNote2025!',
    database: 'endnotenamestitve'
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
    let UporabniskoIme = req.body.UporabniskoIme;
    let UporabniskoGeslo = req.body.UporabniskoGeslo;
    let result = await SQLquery(`SELECT * FROM tablogin WHERE UporabniskoIme = '${UporabniskoIme}' AND UporabniskoGeslo = '${UporabniskoGeslo}'`);
    if(result.length > 0){
        req.session.UporabniskoIme = UporabniskoIme;
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
    res.send({"UporabniskoIme": req.session.UporabniskoIme, "ID": req.session.ID, "Admin": req.session.Admin});
})

server.post('/analitikaUstanove', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, OznakaUstanove FROM tabnamestitev GROUP BY OznakaUstanove ORDER BY Stevilo ASC");
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

server.post('/StNamestitevLeto', async (req, res) => {
    try{
        let result = await SQLquery("SELECT COUNT(*) AS Stevilo, YEAR(DatumNamestitve) AS Leto FROM tabnamestitev GROUP BY YEAR(DatumNamestitve) ORDER BY leto ASC");
        res.send(result);
    }catch (err){
        console.log(err);
        res.status(500);
    }
});

server.post('/Analitika', async (req, res) => {
    try{
        let result = await SQLquery("SELECT IdNamestitve AS '#', Ime, Priimek, Spol, OznakaUstanove, StatusUporabnika AS Status FROM tabnamestitev ORDER BY Priimek, Ime");
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
        let queryString = `INSERT INTO tabnamestitev(Ime,Priimek,Spol,ElektronskaPosta,OznakaUstanove,NazivOS,NazivEndNoteVerzije,StatusUporabnika,ClanicaNamestitve,StopnjaStudijskegaPrograma,OznakaSkrbnika,DatumNamestitve,DatumSpremembe) VALUES("${vnos.Ime}","${vnos.Priimek}","${vnos.Spol}","${vnos.email}","${vnos.OznakaUstanove}","${vnos.OS}","${vnos.EndNoteV}","${vnos.StatusUporabnika}",'UKM',"${vnos.StopnjaStudija}","${vnos.UporabniskoIme}","${vnos.Datum}","${vnos.Datum}")`;
        let queryStringNull = `INSERT INTO tabnamestitev(Ime,Priimek,Spol,ElektronskaPosta,OznakaUstanove,NazivOS,NazivEndNoteVerzije,StatusUporabnika,ClanicaNamestitve,StopnjaStudijskegaPrograma,OznakaSkrbnika,DatumNamestitve,DatumSpremembe) VALUES("${vnos.Ime}","${vnos.Priimek}","${vnos.Spol}","${vnos.email}","${vnos.OznakaUstanove}","${vnos.OS}","${vnos.EndNoteV}","${vnos.StatusUporabnika}",'UKM',NULL,"${vnos.UporabniskoIme}","${vnos.Datum}","${vnos.Datum}")`;
        try{
            if(vnos.StopnjaStudija == "NULL" || vnos.StopnjaStudija == ""){
                result = await SQLquery(queryStringNull);
            }else{
                result = await SQLquery(queryString);
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
        let tabela = req.body.IDTabele
        let result = await SQLquery(`SELECT * FROM ${tabela} WHERE IdNamestitve = '${id}'`);
        res.send(result);
    }catch(err){
        console.log(err);
    }
});

server.post('/pridobiVnosAdmin', async (req, res) => {
    try{
        let id = req.body.ID
        let tabela = req.body.IDTabele
        let nazivID = req.body.nazivID
        let result = await SQLquery(`SELECT * FROM ${tabela} WHERE ${nazivID} = '${id}'`);
        res.send(result);
    }catch(err){
        console.log(err);
    }
});

server.post('/spremeniVnos', async (req, res) => {
    try{
        let result;
        if(req.body.StopnjaStudija == ""){
            result = await SQLquery(`UPDATE tabnamestitev SET Ime = '${req.body.Ime}', Priimek = '${req.body.Priimek}', Spol = '${req.body.Spol}', ElektronskaPosta = '${req.body.email}', OznakaUstanove = '${req.body.OznakaUstanove}', NazivOS = '${req.body.OS}', NazivEndNoteVerzije = '${req.body.EndNoteV}', StatusUporabnika = '${req.body.StatusUporabnika}', ClanicaNamestitve = 'UKM', StopnjaStudijskegaPrograma = NULL, OznakaSkrbnika = '${req.body.UporabniskoIme}', DatumNamestitve = '${req.body.DatumNamestitve}', DatumSpremembe = '${req.body.DatumSpremembe}' WHERE IdNamestitve = '${req.body.ID}'`)
        }else{
            result = await SQLquery(`UPDATE tabnamestitev SET Ime = '${req.body.Ime}', Priimek = '${req.body.Priimek}', Spol = '${req.body.Spol}', ElektronskaPosta = '${req.body.email}', OznakaUstanove = '${req.body.OznakaUstanove}', NazivOS = '${req.body.OS}', NazivEndNoteVerzije = '${req.body.EndNoteV}', StatusUporabnika = '${req.body.StatusUporabnika}', ClanicaNamestitve = 'UKM', StopnjaStudijskegaPrograma = '${req.body.StopnjaStudija}', OznakaSkrbnika = '${req.body.UporabniskoIme}', DatumNamestitve = '${req.body.DatumNamestitve}', DatumSpremembe = '${req.body.DatumSpremembe}' WHERE IdNamestitve = '${req.body.ID}'`)
        }
        res.send(result);
    }catch(err){
        res.send(err);
    }
});

server.post('/spremeniVnosAdmin', async (req, res) => {
    try{
        if(req.body.Tabela == "tablogin"){
            let result;
            if(req.body.Admin == true){
                result = await SQLquery(`UPDATE ${req.body.Tabela} SET OznakaSkrbnika = '${req.body.OznakaSkrbnika}', UporabniskoIme = '${req.body.UporabniskoIme}', UporabniskoGeslo = '${req.body.UporabniskoGeslo}', Admin = true WHERE OznakaSkrbnika = '${req.body.IDvnosa}'`);
            }else{
                result = await SQLquery(`UPDATE ${req.body.Tabela} SET OznakaSkrbnika = '${req.body.OznakaSkrbnika}', UporabniskoIme = '${req.body.UporabniskoIme}', UporabniskoGeslo = '${req.body.UporabniskoGeslo}', Admin = false WHERE OznakaSkrbnika = '${req.body.IDvnosa}'`);
            }
            res.send(result);
        }else if(req.body.Tabela == "tabustanova"){
            let result = await SQLquery(`UPDATE ${req.body.Tabela} SET OznakaUstanove = '${req.body.OznakaUstanove}', NazivUstanove = '${req.body.NazivUstanove}', Ulica = '${req.body.Ulica}', Kraj = '${req.body.Kraj}', PostnaStevilka = '${req.body.PostnaStevilka}' WHERE OznakaUstanove = '${req.body.IDvnosa}'`);
            res.send(result);
        }else if(req.body.Tabela == "tabos"){
            let result = await SQLquery(`UPDATE ${req.body.Tabela} SET NazivOS = '${req.body.NazivOS}', NazivOSAngl = '${req.body.NazivOSAngl}' WHERE NazivOS = '${req.body.IDvnosa}'`);
            res.send(result);
        }else if(req.body.Tabela == "tabendnote"){
            let result = await SQLquery(`UPDATE ${req.body.Tabela} SET NazivEndNoteVerzije = '${req.body.NazivEndNoteVerzije}' WHERE NazivEndNoteVerzije = '${req.body.IDvnosa}'`);
            res.send(result);
        }
    }catch(err){
        res.send(err);
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
        let result = await SQLquery("SELECT * FROM tabustanova");
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

server.post('/AdminUporabniki', async (req, res) => {
    let result = await SQLquery("SELECT * FROM tablogin");
    res.send(result);
});

server.post('/AdminUstanove', async (req, res) => {
    let result = await SQLquery("SELECT * FROM tabustanova");
    res.send(result);
});

server.post('/AdminOS', async (req, res) => {
    let result = await SQLquery("SELECT * FROM tabos");
    res.send(result);
});

server.post('/AdminEndNote', async (req, res) => {
    let result = await SQLquery("SELECT * FROM tabendnote");
    res.send(result);
});

server.post('/AdminIzbris', async (req, res) => {
    let ID = req.body.ID;
    let Tabela = req.body.Tabela;
    if(Tabela == "tablogin"){
        try{
            let result = await SQLquery(`DELETE FROM ${Tabela} WHERE OznakaSkrbnika = '${ID}'`);
            res.status(200);
            res.send(result);
        }catch(err){
            res.status(500);
            res.send(result);
        }
    }else if(Tabela == "tabustanova"){
        try{
            let result = await SQLquery(`DELETE FROM ${Tabela} WHERE OznakaUstanove = '${ID}'`);
            res.status(200);
            res.send(result);
        }catch(err){
            res.status(500);
            res.send(result);
        }
    }else if(Tabela == "tabos"){
        try{
            let result = await SQLquery(`DELETE FROM ${Tabela} WHERE NazivOS = '${ID}'`);
            res.status(200);
            res.send(result);
        }catch(err){
            res.status(500);
            res.send(result);
        }
    }else if(Tabela == "tabendnote"){
        try{
            let result = await SQLquery(`DELETE FROM ${Tabela} WHERE NazivEndNoteVerzije = '${ID}'`);
            res.status(200);
            res.send(result);
        }catch(err){
            res.status(500);
            res.send(result);
        }
    }
    
});

server.post('/AdminVnosUser', async (req, res) => {
    let vnos = req.body;
    let result;
    try{
        if(vnos.Admin == "on"){
            result = await SQLquery(`INSERT INTO tablogin(OznakaSkrbnika,UporabniskoIme,UporabniskoGeslo,Admin) VALUES("${vnos.OznakaSkrbnika}","${vnos.UporabniskoIme}","${vnos.UporabniskoGeslo}","1")`);
        }else{
            result = await SQLquery(`INSERT INTO tablogin(OznakaSkrbnika,UporabniskoIme,UporabniskoGeslo,Admin) VALUES("${vnos.OznakaSkrbnika}","${vnos.UporabniskoIme}","${vnos.UporabniskoGeslo}","0")`);
        }
        res.status(200);
        res.send(result);
    }catch(err){
        res.status(500);
        res.send(err);
    }
});

server.post('/AdminVnosUstanove', async (req, res) => {
    let vnos = req.body;
    try{
        let result = await SQLquery(`INSERT INTO tabustanova(OznakaUstanove,NazivUstanove,Ulica,Kraj,PostnaStevilka) VALUES("${vnos.OznakaUstanove}","${vnos.NazivUstanove}","${vnos.Ulica}","${vnos.Kraj}","${vnos.PostnaStevilka}")`);
        res.send(result);
        res.status(200);
    }catch(err){
        res.send(err);
        res.status(500)
    }
});

server.post('/AdminVnosOS', async (req, res) => {
    let vnos = req.body;
    try{
        let result = await SQLquery(`INSERT INTO tabos(NazivOS,NazivOSAngl) VALUES("${vnos.NazivOS}","${vnos.NazivOSAngl}")`);
        res.send(result);
        res.status(200);
    }catch(err){
        res.send(err);
        res.status(500)
    }
});

server.post('/AdminVnosEN', async (req, res) => {
    let vnos = req.body;
    try{
        let result = await SQLquery(`INSERT INTO tabendnote(NazivEndNoteVerzije) VALUES("${vnos.NazivEndNoteVerzije}")`);
        res.send(result);
        res.status(200);
    }catch(err){
        res.send(err);
        res.status(500)
    }
});

server.listen(PORT, () => {
    console.log(`Server listening at LocalHost:${PORT}`);
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