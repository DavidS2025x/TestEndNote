import {askServer, orderServer} from './serverCommunication.js';
import {chartBar,chartPie} from './graph.js';

    let chartUstanove;
    let chartOS;
    let chartENVer;

function Dashboard(){

    //Če graf obstaja ga uniči preden ga ponovno nariše, preprečimo memory leak
    if(chartUstanove){
        chartUstanove.destroy();
    }
    if(chartOS){
        chartOS.destroy();
    }
    if(chartENVer){
        chartENVer.destroy();
    }

    //Vsebino elementa pobrišemo in vanj vstavimo ostale potrebne elemente
    document.getElementById("Vsebina").innerHTML = '<div class="row flex-grow-1"><div class="col d-flex justify-content-center"><canvas id="StUstanov"  style="width:100%;max-width:700px"></canvas></div></div><div class="row flex-grow-1"><div class="col"><canvas id="StOS" style="width:100%;max-width:700px"></canvas></div><div class="col d-flex flex-column justify-content-center align-items-center"><div class = "display-4" id = "StNamLab"></div><div class = "display-4 font-weight-bold" id = "StNam"></div></div><div class="col"><canvas id="StEN" style="width:100%;max-width:700px"></canvas></div></div>'
    
    //Post metoda na strežnik, dobimo SQL query napisan za tale ROUTE. Preberemo podatke in narišemo graf
    askServer('analitikaUstanove')
    .then(res => res.json())
    .then(data => {

        let QueryData = [];
        let QueryLabel = [];

        //Razdelimo si rezultate SQL poizvedbe v dva polja, enega z podatki drugega z oznakami. Le te nato pošljemo v funkcijo ki nam izriše graf
        for(let i = 0; i < data.length; i++){
            QueryData.push(data[i].Stevilo);
            QueryLabel.push(data[i].Ustanova);
        } 

        chartUstanove = chartBar(QueryData,QueryLabel,document.getElementById("StUstanov"));

    })
    .catch(err => {
        console.log(err);
    })

    //Post metoda na strežnik, dobimo SQL query napisan za tale ROUTE. Preberemo podatke in narišemo graf
    askServer('analitikaOS')
    .then(res => res.json())
    .then(data => {

        let QueryData = [];
        let QueryLabel = [];

        //Razdelimo si rezultate SQL poizvedbe v dva polja, enega z podatki drugega z oznakami. Le te nato pošljemo v funkcijo ki nam izriše graf
        for(let i = 0; i < data.length; i++){
            QueryData.push(data[i].Stevilo);
            QueryLabel.push(data[i].NazivOS);
        }

        chartOS = chartPie(QueryData,QueryLabel,document.getElementById("StOS"));

    })
    .catch(err => {
        console.log(err);
    })

    //Post metoda na strežnik, dobimo SQL query napisan za tale ROUTE. Preberemo podatke in narišemo graf
    askServer('analitikaNamestitve')
    .then(res => res.json())
    .then(data => {

        let QueryData = [];
        let QueryLabel = [];

        //Razdelimo si rezultate SQL poizvedbe v dva polja, enega z podatki drugega z oznakami. Le te nato pošljemo v funkcijo ki nam izriše graf
        for(let i = 0; i < data.length; i++){
            QueryData.push(data[i].Stevilo);
            QueryLabel.push(data[i].NazivEndNoteVerzije);
        }
        chartPie(QueryData,QueryLabel,document.getElementById("StEN"));
    })

    //POST metoda na strežnik, dobimo SQL query napisan za tale ROUTE. Preberemo podatke in izpišemo
    askServer('StNamestitev')
    .then(res => res.json())
    .then(data => {
        console.log(data);
        document.getElementById("StNamLab").innerHTML = "Namestitve";
        document.getElementById("StNam").innerHTML = data[0].Stevilo;
    })

}

function Analitika(){
    //Če graf obstaja ga uniči preden ga ponovno nariše, preprečimo memory leak
    if(chartUstanove){
        chartUstanove.destroy();
    }
    if(chartOS){
        chartOS.destroy();
    }
    if(chartENVer){
        chartENVer.destroy();
    }

    //Izbrišemo vsebino elementa da ga pripravimo na novo vsebino
    document.getElementById("Vsebina").innerHTML = '';

    //POST metoda na strežnik, dobimo SQL query napisan za tale ROUTE
    askServer('Analitika')
    .then(res => res.json())
    .then(data => {

        //Pripravimo vse potrebne elemente za kreiranje tabele s podatki, ki nam jih je poslal strežnik
        let tabela = document.createElement('table');
        tabela.className = "table table-sm table-striped";

        let tabelaHead = document.createElement('thead');
        let tabelaHeadTr = document.createElement('tr');

        //Gremo skozi imena ključev oz. imena stolpcev in jih zapišemo v head vrstico tabele
        Object.entries(data[0]).forEach(([key, value]) => {
            let tabelaHeadTd = document.createElement('th');
            tabelaHeadTd.textContent = key;
            tabelaHeadTr.append(tabelaHeadTd);
        })
        //Ekstra td za ujemanje s številom td v telesu tabele
        let tabelaHeadTd = document.createElement('th');
        tabelaHeadTr.append(tabelaHeadTd);

        tabelaHead.append(tabelaHeadTr);
        tabela.append(tabelaHead)

        let tabelaBody = document.createElement('tbody');
        
        //Gremo skozi vse JSON objekte, ki se nahajajo v polju
        data.forEach((data) => {

            let tr = document.createElement('tr')

            //Gumb za urejanje
            let btn = document.createElement('button');
            btn.textContent = "Uredi";
            btn.onclick = function(){
                urediVnos(document.getElementById(this.className).id);
            }

            //Gumb za brisanje
            let btnDel = document.createElement('button');
            btnDel.textContent = "Izbriši";
            btnDel.onclick = function(){
                IzbrisVnosa(document.getElementById(this.className));
            }

            let btnTd = document.createElement('td');
            btnTd.className = "";

            //Iz teh nato preberemo in zapišemo vrednost v celice tabele, katere nato zapišemo v vrstice tabele, katere nato pripnemo v telo tabele
            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btn.className == ''){
                    btn.className = `${value}`
                }
                if(btnDel.className == ''){
                    btnDel.className = `${value}`;
                }
                if(tr.id == ''){
                    tr.id = `${value}`;
                }
                tr.append(td);
            })
            btnTd.append(btn);
            btnTd.append(btnDel);
            tr.append(btnTd);
            tabelaBody.append(tr);
        });

        tabela.append(tabelaBody);


        document.getElementById("Vsebina").append(tabela);
    })
}

function Obrazec(){
    //Če graf obstaja ga uniči preden ga ponovno nariše, preprečimo memory leak
    if(chartUstanove){
        chartUstanove.destroy();
    }
    if(chartOS){
        chartOS.destroy();
    }
    if(chartENVer){
        chartENVer.destroy();
    }
    
    fetch('/HTML/NewForm.html')
            .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
            .then(html => {
                document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
                document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault(); 

                        let Ime = document.getElementById("Ime").value;
                        let Priimek = document.getElementById("Priimek").value;
                        let Spol = document.getElementById("Spol").value;
                        let StatusUporabnika = document.getElementById("StatusUporabnika").value;
                        let StopnjaStudija = document.getElementById("StopnjaStudija").value;
                        let username = document.getElementById("username").value;
                        let email = document.getElementById("email").value;
                        let EndNoteV = document.getElementById("EndNoteV").value;
                        let OS = document.getElementById("OS").value;
                        let Ustanova = document.getElementById("Ustanova").value;
                        let Datum = document.getElementById("Datum").value;

                        if(document.getElementById('StopnjaStudija').disabled){
                            novVnos({"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":"","username":username,"email":email,"EndNoteV":EndNoteV,"OS":OS,"Ustanova":Ustanova,"Datum":Datum});
                        }else{
                            novVnos({"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":StopnjaStudija,"username":username,"email":email,"EndNoteV":EndNoteV,"OS":OS,"Ustanova":Ustanova,"Datum":Datum});
                        }
                        
                        
                    });

                    let selectElement = document.getElementById('StatusUporabnika');
                    let inputElement = document.getElementById('StopnjaStudija');

                    selectElement.addEventListener('change', function() {
                        
                        if (selectElement.value === 'Študent') {
                            inputElement.disabled = false;
                        } else {
                            inputElement.disabled = true;
                        }
                    });

                //Dinamična generacija form options
                askServer('Status')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('StatusUporabnika')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.StatusUporabnika;
                        option.textContent = value.StatusUporabnika;
                        target.appendChild(option);
                    });
                });

                askServer('Stopnja')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('StopnjaStudija')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.StopnjaStudijskegaPrograma;
                        option.textContent = value.StopnjaStudijskegaPrograma;
                        target.appendChild(option);
                    });
                });

                
                askServer('EndNote')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('EndNoteV')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.NazivEndNoteVerzije;
                        option.textContent = value.NazivEndNoteVerzije;
                        target.appendChild(option);
                    });
                });

                askServer('OS')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('OS')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.NazivOS;
                        option.textContent = value.NazivOS;
                        target.appendChild(option);
                    });
                });
                
                askServer('Ustanova')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('Ustanova')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.Kratica;
                        option.textContent = value.Kratica;
                        target.appendChild(option);
                    });
                });

            })
            .catch(error => console.error('Napaka pri nalaganju vsebine:', error));
}

function novVnos(formData){

    orderServer("/Vnos",JSON.stringify(formData),"vnesi");

    document.getElementById("Vnos").reset();

};

function IzbrisVnosa(element){
    if(confirm(`Ste prepričani da želite izbrisati vnos z ID ${element.id}`)){
        orderServer("Izbris",`{"ID":"${element.id}"}`,"izbrisi")
        .then(data => {
            Analitika(document.getElementById("Vsebina"));
        });
    }
}

function urediVnos(IdVnosa){

    let result;
    askServer("pridobiVnos",`{"ID":"${IdVnosa}"}`)
    .then(req => req.json())
    .then(data => {
        result = data;
    });

    fetch('/HTML/NewForm.html')
            .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
            .then(html => {
                document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
                document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();

                        let Ime = document.getElementById("Ime").value;
                        let Priimek = document.getElementById("Priimek").value;
                        let Spol = document.getElementById("Spol").value;
                        let StatusUporabnika = document.getElementById("StatusUporabnika").value;
                        let StopnjaStudija = document.getElementById("StopnjaStudija").value;
                        let username = document.getElementById("username").value;
                        let email = document.getElementById("email").value;
                        let EndNoteV = document.getElementById("EndNoteV").value;
                        let OS = document.getElementById("OS").value;
                        let Ustanova = document.getElementById("Ustanova").value;
                        let Datum = document.getElementById("Datum").value;

                        let queryString;

                        if(document.getElementById('StopnjaStudija').disabled){
                            queryString = {"ID":IdVnosa,"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":"","username":username,"email":email,"EndNoteV":EndNoteV,"OS":OS,"Ustanova":Ustanova,"Datum":Datum} 
                        }else{
                            queryString = {"ID":IdVnosa,"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":StopnjaStudija,"username":username,"email":email,"EndNoteV":EndNoteV,"OS":OS,"Ustanova":Ustanova,"Datum":Datum} 
                        }

                        orderServer("spremeniVnos",JSON.stringify(queryString),"uredi");
                    
                });

                let selectElement = document.getElementById('StatusUporabnika');
                    let inputElement = document.getElementById('StopnjaStudija');

                    selectElement.addEventListener('change', function() {
                        
                        if (selectElement.value === 'Študent') {
                            inputElement.disabled = false;
                        } else {
                            inputElement.disabled = true;
                        }
                    });

                //Dinamična generacija form options
                askServer('Status')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('StatusUporabnika')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.StatusUporabnika;
                        option.textContent = value.StatusUporabnika;
                        target.appendChild(option);
                    });
                });

                askServer('Stopnja')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('StopnjaStudija')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.StopnjaStudijskegaPrograma;
                        option.textContent = value.StopnjaStudijskegaPrograma;
                        target.appendChild(option);
                    });
                });

                
                askServer('EndNote')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('EndNoteV')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.NazivEndNoteVerzije;
                        option.textContent = value.NazivEndNoteVerzije;
                        target.appendChild(option);
                    });
                });

                askServer('OS')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('OS')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.NazivOS;
                        option.textContent = value.NazivOS;
                        target.appendChild(option);
                    });
                });
                
                askServer('Ustanova')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('Ustanova')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.Kratica;
                        option.textContent = value.Kratica;
                        target.appendChild(option);
                    });
                });
            });
}

window.Dashboard = Dashboard;
window.Analitika = Analitika;
window.Obrazec = Obrazec;
