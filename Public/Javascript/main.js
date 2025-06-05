import {askServer, orderServer} from './serverCommunication.js';
import {chartBar,chartPie} from './graph.js';
import {iskanjeTabela, sortirajTabelo} from './tableControl.js';

    let chartUstanove;
    let chartOS;
    let chartENVer;
    let chartSpol;

    let modal = new bootstrap.Modal(document.getElementById('mojModal'));

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
    if(chartSpol){
        chartSpol.destroy();
    }

    //Vsebino elementa pobrišemo in vanj vstavimo ostale potrebne elemente
    fetch('/HTML/Dashboard.html')
    .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
    .then(html => {
        document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
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
            chartUstanove = chartPie(QueryData,QueryLabel,document.getElementById("StEN"));
        })

        //POST metoda na strežnik, dobimo SQL query napisan za tale ROUTE. Preberemo podatke in izpišemo
        askServer('StNamestitev')
        .then(res => res.json())
        .then(data => {
            document.getElementById("StNam").innerHTML = data[0].Stevilo;
        })

        askServer('analitikaSpol')
        .then(res => res.json())
        .then(data => {
            let QueryData = [];
            let QueryLabel = [];

            //Razdelimo si rezultate SQL poizvedbe v dva polja, enega z podatki drugega z oznakami. Le te nato pošljemo v funkcijo ki nam izriše graf
            for(let i = 0; i < data.length; i++){
                QueryData.push(data[i].Stevilo);
                QueryLabel.push(data[i].Spol);
            } 

            chartSpol = chartPie(QueryData,QueryLabel,document.getElementById("StSpol"));

        });
    });
    
    

}

async function Analitika(){
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

    const uporabnik = await user();
    const isAdmin = uporabnik.Admin;

    //POST metoda na strežnik, dobimo SQL query napisan za tale ROUTE
    askServer('Analitika')
    .then(res => res.json())
    .then(data => {
        //Ustvarimo in dodamo gumb za novi vnos
        let addButton = document.createElement("button");
                addButton.innerText="NOV VNOS +";
                addButton.className="dodaj";
                addButton.onclick = function(){
                    Obrazec();
                }

        //Ustvarimo lable za iskalno polje
        let label = document.createElement("label");
                label.htmlFor = "iskalnoPolje";
                label.innerText = "Iskanje";
                label.className = "form-label text-center";

        //Ustvarimo nov input za iskanje
        let searchBar = document.createElement("input");
                searchBar.type="text";
                searchBar.id="iskalnoPolje";
                searchBar.onkeyup = function(){
                    iskanjeTabela(document.getElementById("iskalnoPolje"),document.getElementById("IzpisPB"));
                }
                searchBar.className = "form-control";
                searchBar.placeholder = "Vnesi poljuben niz";

        //Ustvarimo nov gumb za izbris iskanja
        let clearButton = document.createElement("button");
                clearButton.innerText="X";
                clearButton.className="iskanje";
                clearButton.onclick = function(){
                    document.getElementById("iskalnoPolje").value = "";
                    iskanjeTabela(document.getElementById("iskalnoPolje"),document.getElementById("IzpisPB"));
                }

        //Ustvarimo nov div element za shranjevanje iskalnega polja
        let searchContainer = document.createElement("div");
                searchContainer.className = "container d-flex flow-row ms-0 mt-2 mb-2 align-items-center";
                searchContainer.append(label);
                searchContainer.append(searchBar);
                searchContainer.append(clearButton);
        if(isAdmin){
            document.getElementById("Vsebina").append(addButton);
        }
        document.getElementById("Vsebina").append(searchContainer);

        //Pripravimo vse potrebne elemente za kreiranje tabele s podatki, ki nam jih je poslal strežnik
        let tabela = document.createElement('table');
        tabela.className = "table table-sm";
        tabela.id = "IzpisPB"

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

            if(isAdmin){
                btnTd.append(btn);
                btnTd.append(btnDel);
                tr.append(btnTd);
            }

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
                
                let danes = new Date().toISOString().split("T")[0];
                document.getElementById("Datum").value = danes;

                document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault(); 

                        let Ime = document.getElementById("Ime").value;
                        let Priimek = document.getElementById("Priimek").value;
                        let Spol = document.getElementById("Spol").value;
                        let StatusUporabnika = document.getElementById("StatusUporabnika").value;
                        let StopnjaStudija = document.getElementById("StopnjaStudija").value;
                        let UporabniskoIme = document.getElementById("UporabniskoIme").value;
                        let email = document.getElementById("email").value;
                        let EndNoteV = document.getElementById("EndNoteV").value;
                        let OS = document.getElementById("OS").value;
                        let Ustanova = document.getElementById("Ustanova").value;
                        let Datum = document.getElementById("Datum").value;

                        if(document.getElementById('StopnjaStudija').disabled){
                            novVnos({"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":"","UporabniskoIme":UporabniskoIme,"email":email,"EndNoteV":EndNoteV,"OS":OS,"OznakaUstanove":Ustanova,"Datum":Datum});
                            Obrazec();
                        }else{
                            novVnos({"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":StopnjaStudija,"UporabniskoIme":UporabniskoIme,"email":email,"EndNoteV":EndNoteV,"OS":OS,"OznakaUstanove":Ustanova,"Datum":Datum});
                            Obrazec();
                        }
                        
                        
                        
                    });

                    let selectElement = document.getElementById('StatusUporabnika');
                    let inputElement = document.getElementById('StopnjaStudija');

                    selectElement.addEventListener('change', function() {
                        
                        if (selectElement.value === 'Študent') {
                            inputElement.disabled = false;
                            inputElement.required = true;
                        } else {
                            inputElement.disabled = true;
                            inputElement.required = false;
                            inputElement.value = null;
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
                    target.value = null;
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
                    target.value = null;
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
                    target.value = null;
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
                    target.value = null;
                });
                
                askServer('Ustanova')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('Ustanova')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.OznakaUstanove;
                        option.textContent = value.OznakaUstanove;
                        target.appendChild(option);
                    });
                    target.value = null;
                    //Izberi celoten tekst v inputu, ko nanj pritisnemo
                    document.querySelectorAll("label").forEach(label => {
                        label.addEventListener("click", (e) => {
                            const inputId = label.getAttribute("for");
                            const input = document.getElementById(inputId);
                            if (input && input.select) {
                                // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                                setTimeout(() => input.select(), 0);
                            }
                        });
                    });
                });

                user().then(result => {
                    let UporabniskoIme = document.createElement("option");
                    UporabniskoIme.value = result.ID;
                    UporabniskoIme.innerHTML = result.UporabniskoIme;

                    document.getElementById("UporabniskoIme").appendChild(UporabniskoIme);
                })

            })
            .catch(error => console.error('Napaka pri nalaganju vsebine:', error));
}

function novVnos(formData){
    
    orderServer("/Vnos",JSON.stringify(formData),"vnesi")
    .then(response => {
        if (response.ok) {
            document.getElementById("modalNaslov").innerHTML = "Status Vnosa";
            document.getElementById("modalVsebina").innerHTML = "Vnos je bil uspešen!";
            modal.show();
        } else {
            console.error("Napaka pri vnosu:", response.statusText);
            document.getElementById("modalNaslov").innerHTML = "Status Vnosa";
            document.getElementById("modalVsebina").innerHTML = "Vnos ni bil uspešen!";
            modal.show();
        }
    });

};

function IzbrisVnosa(element){
    if(confirm(`Ste prepričani da želite izbrisati vnos z ID ${element.id}?`)){
        orderServer("Izbris",`{"ID":"${element.id}"}`,"izbrisi")
        .then(data => {
            setTimeout(() => {
                Analitika();
            }, 10);
        });
    }
}

function urediVnos(IdVnosa){

    let result;

    askServer("pridobiVnos",`{"ID":"${IdVnosa}","IDTabele":"tabnamestitev"}`)
    .then(req => req.json())
    .then(dataTemp => {
        result = dataTemp[0];
        
        fetch('/HTML/NewForm.html')
            .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
            .then(html => {
                document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument

                let danes = new Date().toISOString().split("T")[0];
                document.getElementById("Datum").value = danes;

                document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();

                        let Ime = document.getElementById("Ime").value;
                        let Priimek = document.getElementById("Priimek").value;
                        let Spol = document.getElementById("Spol").value;
                        let StatusUporabnika = document.getElementById("StatusUporabnika").value;
                        let StopnjaStudija = document.getElementById("StopnjaStudija").value;
                        let UporabniskoIme = document.getElementById("UporabniskoIme").value;
                        let email = document.getElementById("email").value;
                        let EndNoteV = document.getElementById("EndNoteV").value;
                        let OS = document.getElementById("OS").value;
                        let Ustanova = document.getElementById("Ustanova").value;
                        let Datum = document.getElementById("Datum").value;

                        let queryString;

                        if(document.getElementById('StopnjaStudija').disabled){
                            queryString = {"ID":IdVnosa,"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":"","UporabniskoIme":UporabniskoIme,"email":email,"EndNoteV":EndNoteV,"OS":OS,"OznakaUstanove":Ustanova,"Datum":Datum} 
                        }else{
                            queryString = {"ID":IdVnosa,"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":StopnjaStudija,"UporabniskoIme":UporabniskoIme,"email":email,"EndNoteV":EndNoteV,"OS":OS,"OznakaUstanove":Ustanova,"Datum":Datum} 
                        }

                        orderServer("spremeniVnos",JSON.stringify(queryString),"uredi")
                        .then(req => {
                            Analitika();
                        })
                });

                document.getElementById("Vnos").addEventListener("reset", function(event) {
                    event.preventDefault();
                    document.getElementById("Ime").value = result.Ime;
                    document.getElementById("Priimek").value = result.Priimek;
                    document.getElementById("Spol").value = result.Spol;
                    //document.getElementById("UporabniskoIme").value = result.OznakaSkrbnika;
                    document.getElementById("email").value = result.ElektronskaPosta;
                    document.getElementById("Ustanova").value = result.Ustanova;
                    document.getElementById("StatusUporabnika").value = result.StatusUporabnika;
                    if(result.StopnjaStudijskegaPrograma == null){
                        document.getElementById("StopnjaStudija").value = null;
                        document.getElementById("StopnjaStudija").disabled = true;
                    }else{
                        document.getElementById("StopnjaStudija").value = result.StopnjaStudijskegaPrograma;
                        document.getElementById("StopnjaStudija").disabled = false;
                    }
                    document.getElementById("EndNoteV").value = result.NazivEndNoteVerzije;
                    document.getElementById("OS").value = result.NazivOS;

                    let danes = new Date().toISOString().split("T")[0];
                    document.getElementById("Datum").value = danes;

                    user().then(result => {
                        document.getElementById("UporabniskoIme").value = result.ID;
                    })
                });

                    let selectElement = document.getElementById('StatusUporabnika');
                    let inputElement = document.getElementById('StopnjaStudija');

                    if(result.StatusUporabnika == "Študent"){
                        inputElement.disabled = false;
                        inputElement.required = true;
                    }

                    selectElement.addEventListener('change', function() {
                        
                        if (selectElement.value === 'Študent') {
                            inputElement.disabled = false;
                            inputElement.required = true;
                        } else {
                            inputElement.disabled = true;
                            inputElement.required = false;
                            inputElement.value = null;
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
                    document.getElementById("StatusUporabnika").value = result.StatusUporabnika;
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
                    document.getElementById("StopnjaStudija").value = result.StopnjaStudijskegaPrograma;
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
                    document.getElementById("EndNoteV").value = result.NazivEndNoteVerzije;
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
                    document.getElementById("OS").value = result.NazivOS;
                });
                
                askServer('Ustanova')
                .then(req => req.json())
                .then(data => {
                    let target = document.getElementById('Ustanova')
                    Object.entries(data).forEach(([key, value]) => {
                        let option = document.createElement('option');
                        option.value = value.OznakaUstanove;
                        option.textContent = value.OznakaUstanove;
                        target.appendChild(option);
                    });
                    document.getElementById("Ustanova").value = result.Ustanova;
                });

                user().then(result => {
                    let UporabniskoIme = document.createElement("option");
                    UporabniskoIme.value = result.ID;
                    UporabniskoIme.innerHTML = result.UporabniskoIme;

                    document.getElementById("UporabniskoIme").appendChild(UporabniskoIme);
                })

                document.getElementById("Ime").value = result.Ime;
                document.getElementById("Priimek").value = result.Priimek;
                document.getElementById("Spol").value = result.Spol;
                document.getElementById("UporabniskoIme").value = result.OznakaSkrbnika;
                document.getElementById("email").value = result.ElektronskaPosta;
            });
    });

    
}

async function Odjava(){
    const response = await askServer('/Odjava');

    if (response.redirected) {
        window.location.href = response.url;
    } else {
        console.error("Odjava ni uspela.");
    }
}

async function user(){
    const result = await askServer("/user")
    return result.json();
}

function ObrazecAdmin(obrazec){
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

    document.getElementById("Vsebina").innerHTML = '';

    if(obrazec == "AdminUporabniki"){
        fetch('/HTML/AdminUser.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    console.log()
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosUser', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            Administracija("tablogin");
                        }, 100);
                    });
            });
        });
    }else if(obrazec == "AdminUstanove"){
        fetch('/HTML/AdminUstanove.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    console.log()
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosUstanove', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            Administracija("tabustanova");
                        }, 100);
                    });
            });
        });
    }else if(obrazec == "AdminOS"){
        fetch('/HTML/AdminOS.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    console.log()
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosOS', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            Administracija("tabos");
                        }, 100);
                    });
            });
        });
    }else if(obrazec == "AdminEndNote"){
        fetch('/HTML/AdminEN.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    console.log()
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosEN', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            Administracija("tabendnote");
                        }, 100);
                    });
            });
        });
    }
}

function Administracija(tabelaIzbira){
    if(chartUstanove){
        chartUstanove.destroy();
    }
    if(chartOS){
        chartOS.destroy();
    }
    if(chartENVer){
        chartENVer.destroy();
    }

    document.getElementById("Vsebina").innerHTML = '';

    let poizvedba
    if(tabelaIzbira == "tablogin"){
        poizvedba = "AdminUporabniki";
    }else if(tabelaIzbira == "tabustanova"){
        poizvedba = "AdminUstanove";
    }else if(tabelaIzbira == "tabos"){
        poizvedba = "AdminOS";
    }else if(tabelaIzbira == "tabendnote"){
        poizvedba = "AdminEndNote";
    }
    askServer(poizvedba)
    .then(res => res.json())
    .then(data => {
        //Ustvarimo in dodamo gumb za novi vnos
        let addButton = document.createElement("button");
                addButton.innerText="NOV VNOS +";
                addButton.className="dodaj";
                addButton.onclick = function(){
                    ObrazecAdmin(poizvedba);
                }

        //Ustvarimo lable za iskalno polje
        let label = document.createElement("label");
                label.htmlFor = "iskalnoPolje";
                label.innerText = "Iskanje";
                label.className = "form-label text-center";

        //Ustvarimo nov input za iskanje
        let searchBar = document.createElement("input");
                searchBar.type="text";
                searchBar.id="iskalnoPolje";
                searchBar.onkeyup = function(){
                    iskanjeTabela(document.getElementById("iskalnoPolje"),document.getElementById("IzpisPB"));
                }
                searchBar.className = "form-control";
                searchBar.placeholder = "Vnesi poljuben niz";

        //Ustvarimo nov gumb za izbris iskanja
        let clearButton = document.createElement("button");
                clearButton.innerText="X";
                clearButton.className="iskanje";
                clearButton.onclick = function(){
                    document.getElementById("iskalnoPolje").value = "";
                    iskanjeTabela(document.getElementById("iskalnoPolje"),document.getElementById("IzpisPB"));
                }

        //Ustvarimo nov div element za shranjevanje iskalnega polja
        let searchContainer = document.createElement("div");
        searchContainer.className = "container d-flex flow-row ms-0 mt-2 mb-2 align-items-center";
        searchContainer.append(label);
        searchContainer.append(searchBar);
        searchContainer.append(clearButton);

        document.getElementById("Vsebina").append(addButton);
        document.getElementById("Vsebina").append(searchContainer);

        //Pripravimo vse potrebne elemente za kreiranje tabele s podatki, ki nam jih je poslal strežnik
        let tabela = document.createElement('table');
        tabela.className = "table table-sm";
        tabela.id = "IzpisPB"

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
                urediVnosAdmin(this.id,this.className);
            }

            //Gumb za brisanje
            let btnDel = document.createElement('button');
            btnDel.textContent = "Izbriši";
            btnDel.onclick = function(){
                IzbrisAdmin(this);
            }

            let btnTd = document.createElement('td');
            btnTd.className = "";

            //Iz teh nato preberemo in zapišemo vrednost v celice tabele, katere nato zapišemo v vrstice tabele, katere nato pripnemo v telo tabele
            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btn.className == ''){
                    btn.className = tabelaIzbira;
                    btn.id = `${value}`
                }
                if(btnDel.className == ''){
                    btnDel.className = tabelaIzbira;
                    btnDel.id = `${value}`;
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

function IzbrisAdmin(element){
    console.log(element);
    console.log(element.id);
    console.log(element.className);
    if(confirm(`Ste prepričani da želite izbrisati vnos z ID ${element.id}?`)){
        if(element.className == "tablogin"){
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    Administracija("tablogin");
            });
        }else if(element.className == "tabustanova"){
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    Administracija("tabustanova");
            });
        }else if(element.className == "tabos"){
            console.log("OS");
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    Administracija("tabos");
            });
        }else if(element.className == "tabendnote"){
            console.log("EndNote");
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    Administracija("tabendnote");
            });
        }
    }
}

function urediVnosAdmin(IDVnosa,tabelaIzbira){
    
        if(tabelaIzbira == "tablogin"){
            askServer("pridobiVnosAdmin",`{"ID":"${IDVnosa}","IDTabele":"${tabelaIzbira}","nazivID":"oznakaSkrbnika"}`)
            .then(req => req.json())
            .then(dataTemp => {
                console.log(dataTemp);
                fetch('/HTML/AdminUser.html')
                .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
                .then(html => {
                    document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument

                    document.getElementById("Vnos").addEventListener("submit", function(event) {
                        event.preventDefault();
                        let OznakaSkrbnika = document.getElementById("OznakaSkrbnika").value;
                        let UporabniskoIme = document.getElementById("UporabniskoIme").value;
                        let UporabniskoGeslo = document.getElementById("UporabniskoGeslo").value;
                        let Admin = document.getElementById("Admin").checked;
                        let IDvnosa = dataTemp[0].OznakaSkrbnika;
                        
                        fetch('SpremeniVnosAdmin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"IDvnosa":IDvnosa, "OznakaSkrbnika":OznakaSkrbnika ,"UporabniskoIme":UporabniskoIme,"UporabniskoGeslo":UporabniskoGeslo,"Admin":Admin, "Tabela":tabelaIzbira})
                        }).then(res => {
                                Administracija("tablogin");
                        });

                    });

                    document.getElementById("Vnos").addEventListener("reset", function(event) {
                        event.preventDefault();

                        document.getElementById("OznakaSkrbnika").value = dataTemp[0].OznakaSkrbnika;
                        document.getElementById("UporabniskoIme").value = dataTemp[0].UporabniskoIme;
                        document.getElementById("UporabniskoGeslo").value = dataTemp[0].UporabniskoGeslo;

                        if(dataTemp[0].Admin == 1){
                            document.getElementById("Admin").checked = true;
                        }else{
                            document.getElementById("Admin").checked = false;
                        }
                    });

                    document.getElementById("OznakaSkrbnika").value = dataTemp[0].OznakaSkrbnika;
                    document.getElementById("UporabniskoIme").value = dataTemp[0].UporabniskoIme;
                    document.getElementById("UporabniskoGeslo").value = dataTemp[0].UporabniskoGeslo;

                    if(dataTemp[0].Admin == 1){
                        document.getElementById("Admin").checked = true;
                    }else{
                        document.getElementById("Admin").checked = false;
                    }

                });
            });
        }else if(tabelaIzbira == "tabustanova"){
            askServer("pridobiVnosAdmin",`{"ID":"${IDVnosa}","IDTabele":"${tabelaIzbira}","nazivID":"OznakaUstanove"}`)
            .then(req => req.json())
            .then(dataTemp => {
                console.log(dataTemp);
                fetch('/HTML/AdminUstanove.html')
                .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
                .then(html => {
                    document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument

                    document.getElementById("Vnos").addEventListener("submit", function(event) {
                        event.preventDefault();

                        let OznakaUstanove = document.getElementById("OznakaUstanove").value;
                        let NazivUstanove = document.getElementById("NazivUstanove").value;
                        let Ulica = document.getElementById("Ulica").value;
                        let IDvnosa = dataTemp[0].OznakaUstanove;

                        fetch('SpremeniVnosAdmin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"IDvnosa":IDvnosa, "OznakaUstanove":OznakaUstanove, "NazivUstanove":NazivUstanove, "Ulica":Ulica ,"Tabela":tabelaIzbira})
                        }).then(res => {
                                Administracija("tabustanova");
                        });
                    });

                    document.getElementById("Vnos").addEventListener("reset", function(event) {
                        event.preventDefault();

                        document.getElementById("OznakaUstanove").value = dataTemp[0].OznakaUstanove;
                        document.getElementById("NazivUstanove").value = dataTemp[0].NazivUstanove;
                        document.getElementById("Ulica").value = dataTemp[0].Ulica;

                    });

                    document.getElementById("OznakaUstanove").value = dataTemp[0].OznakaUstanove;
                    document.getElementById("NazivUstanove").value = dataTemp[0].NazivUstanove;
                    document.getElementById("Ulica").value = dataTemp[0].Ulica;

                });
            });
        }else if(tabelaIzbira == "tabos"){
            askServer("pridobiVnosAdmin",`{"ID":"${IDVnosa}","IDTabele":"${tabelaIzbira}","nazivID":"NazivOS"}`)
            .then(req => req.json())
            .then(dataTemp => {
                console.log(dataTemp);
                fetch('/HTML/AdminOS.html')
                .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
                .then(html => {
                    document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument

                    document.getElementById("Vnos").addEventListener("submit", function(event) {
                        event.preventDefault();

                        let NazivOS = document.getElementById("NazivOS").value;
                        let NazivOSAngl = document.getElementById("NazivOSAngl").value;
                        let IDvnosa = dataTemp[0].NazivOS;

                        fetch('SpremeniVnosAdmin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"IDvnosa":IDvnosa, "NazivOS":NazivOS, "NazivOSAngl":NazivOSAngl ,"Tabela":tabelaIzbira})
                        }).then(res => {
                                Administracija("tabos");
                        });
                    });

                    document.getElementById("Vnos").addEventListener("reset", function(event) {
                        event.preventDefault();

                        document.getElementById("NazivOS").value = dataTemp[0].NazivOS;
                        document.getElementById("NazivOSAngl").value = dataTemp[0].NazivOSAngl;
                    });

                    document.getElementById("NazivOS").value = dataTemp[0].NazivOS;
                    document.getElementById("NazivOSAngl").value = dataTemp[0].NazivOSAngl;

                });
            });
        }else if(tabelaIzbira == "tabendnote"){
            askServer("pridobiVnosAdmin",`{"ID":"${IDVnosa}","IDTabele":"${tabelaIzbira}","nazivID":"nazivEndNoteVerzije"}`)
            .then(req => req.json())
            .then(dataTemp => {
                console.log(dataTemp);
                fetch('/HTML/AdminEN.html')
                .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
                .then(html => {
                    document.getElementById('Vsebina').innerHTML = html;  // Dodaj HTML v glavni dokument

                    document.getElementById("Vnos").addEventListener("submit", function(event) {
                        event.preventDefault();

                        let NazivEndNoteVerzije = document.getElementById("NazivEndNoteVerzije").value;
                        let IDvnosa = dataTemp[0].NazivEndNoteVerzije;

                        fetch('SpremeniVnosAdmin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"IDvnosa":IDvnosa, "NazivEndNoteVerzije":NazivEndNoteVerzije ,"Tabela":tabelaIzbira})
                        }).then(res => {
                                Administracija("tabendnote");
                        });
                    });

                    document.getElementById("Vnos").addEventListener("reset", function(event) {
                        event.preventDefault();

                        document.getElementById("NazivEndNoteVerzije").value = dataTemp[0].NazivEndNoteVerzije;
                    });

                    document.getElementById("NazivEndNoteVerzije").value = dataTemp[0].NazivEndNoteVerzije;
                });
            });
        }
}

/*
function Administracija(){
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

    fetch('/HTML/AdminForm.html')
            .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
            .then(html => {
                document.getElementById('Vsebina').innerHTML = html;
                AdministracijaUporabniki();
            });
}

function AdministracijaUporabniki(){
    askServer('Uporabnik')
    .then(res => res.json())
    .then(data => {
        //Administracija Vnos
        document.getElementById("AdminVnos").innerHTML = '';
        fetch('/HTML/AdminUser.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('AdminVnos').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosUser', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            AdministracijaUporabniki();
                        }, 100);
                    });
            });
        });
        //Administracija Izbris
        document.getElementById("AdminIzbris").innerHTML = '';

        let tabela = document.createElement('table');
        tabela.className = "table table-sm";
        tabela.id = "SifrantTabela"

        let tabelaHead = document.createElement('thead');
        let tabelaHeadTr = document.createElement('tr');

        //Gremo skozi imena ključev oz. imena stolpcev in jih zapišemo v head vrstico tabele
        Object.entries(data[0]).forEach(([key, value]) => {
            let tabelaHeadTd = document.createElement('th');
            tabelaHeadTd.innerHTML = key;
            tabelaHeadTr.append(tabelaHeadTd);
        });

        let tabelaHeadBtn = document.createElement('th');
        tabelaHeadTr.append(tabelaHeadBtn)

        tabelaHead.append(tabelaHeadTr);
        tabela.append(tabelaHead);

        let tabelaBody = document.createElement('tbody');

        data.forEach((data) => {
            let tr = document.createElement('tr')

            let btnDel = document.createElement('button');
            btnDel.textContent = "Izbriši";
            btnDel.onclick = function(){
                IzbrisAdmin(this);
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tablogin`;
                }
                tr.append(td);
            })

            btnTd.append(btnDel);
            tr.append(btnTd);

            tabelaBody.append(tr);
        });

        tabela.append(tabelaBody);
        document.getElementById("AdminIzbris").append(tabela);

        document.querySelectorAll("label").forEach(label => {
            label.addEventListener("click", (e) => {
                const inputId = label.getAttribute("for");
                const input = document.getElementById(inputId);
                if (input && input.select) {
                    // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                    setTimeout(() => input.select(), 0);
                }
            });
        });

    })
}
function AdministracijaUstanove(){
    askServer('Ustanova')
    .then(res => res.json())
    .then(data => {
        //Administracija Vnos
        document.getElementById("AdminVnos").innerHTML = '';
        fetch('/HTML/AdminUstanove.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('AdminVnos').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosUstanove', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            AdministracijaUstanove();
                        }, 100);
                    });
            });
        });
        //Administracija Izbris
        document.getElementById("AdminIzbris").innerHTML = '';

        let tabela = document.createElement('table');
        tabela.className = "table table-sm";
        tabela.id = "SifrantTabela"

        let tabelaHead = document.createElement('thead');
        let tabelaHeadTr = document.createElement('tr');

        //Gremo skozi imena ključev oz. imena stolpcev in jih zapišemo v head vrstico tabele
        Object.entries(data[0]).forEach(([key, value]) => {
            let tabelaHeadTd = document.createElement('th');
            tabelaHeadTd.innerHTML = key;
            tabelaHeadTr.append(tabelaHeadTd);
        });

        let tabelaHeadBtn = document.createElement('th');
        tabelaHeadTr.append(tabelaHeadBtn)

        tabelaHead.append(tabelaHeadTr);
        tabela.append(tabelaHead);

        let tabelaBody = document.createElement('tbody');

        data.forEach((data) => {
            let tr = document.createElement('tr')

            let btnDel = document.createElement('button');
            btnDel.textContent = "Izbriši";
            btnDel.onclick = function(){
                IzbrisAdmin(this);
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabustanova`;
                }
                tr.append(td);
            })

            btnTd.append(btnDel);
            tr.append(btnTd);

            tabelaBody.append(tr);
        });

        tabela.append(tabelaBody);
        document.getElementById("AdminIzbris").append(tabela);

    })
}
function AdministracijaOS(){
    askServer('OS')
    .then(res => res.json())
    .then(data => {
        //Administracija Vnos
        document.getElementById("AdminVnos").innerHTML = '';
        fetch('/HTML/AdminOS.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('AdminVnos').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosOS', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            AdministracijaOS();
                        }, 100);
                    });
            });
        });
        //Administracija Izbris
        document.getElementById("AdminIzbris").innerHTML = '';

        let tabela = document.createElement('table');
        tabela.className = "table table-sm";
        tabela.id = "SifrantTabela"

        let tabelaHead = document.createElement('thead');
        let tabelaHeadTr = document.createElement('tr');

        //Gremo skozi imena ključev oz. imena stolpcev in jih zapišemo v head vrstico tabele
        Object.entries(data[0]).forEach(([key, value]) => {
            let tabelaHeadTd = document.createElement('th');
            tabelaHeadTd.innerHTML = key;
            tabelaHeadTr.append(tabelaHeadTd);
        });

        let tabelaHeadBtn = document.createElement('th');
        tabelaHeadTr.append(tabelaHeadBtn)

        tabelaHead.append(tabelaHeadTr);
        tabela.append(tabelaHead);

        let tabelaBody = document.createElement('tbody');

        data.forEach((data) => {
            let tr = document.createElement('tr')

            let btnDel = document.createElement('button');
            btnDel.textContent = "Izbriši";
            btnDel.onclick = function(){
                IzbrisAdmin(this);
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabos`;
                }
                tr.append(td);
            })

            btnTd.append(btnDel);
            tr.append(btnTd);

            tabelaBody.append(tr);
        });

        tabela.append(tabelaBody);
        document.getElementById("AdminIzbris").append(tabela);

    })
}
function AdministracijaEndNote(){
    askServer('EndNote')
    .then(res => res.json())
    .then(data => {
        //Administracija Vnos
        document.getElementById("AdminVnos").innerHTML = '';
        fetch('/HTML/AdminEN.html')
        .then(response => response.text())  // Pretvori odgovor v besedilo (HTML)
        .then(html => {
            document.getElementById('AdminVnos').innerHTML = html;  // Dodaj HTML v glavni dokument
            document.querySelectorAll("label").forEach(label => {
                label.addEventListener("click", (e) => {
                    const inputId = label.getAttribute("for");
                    const input = document.getElementById(inputId);
                    if (input && input.select) {
                        // Delay, ker label klik včasih samo fokusira input, ne izbere takoj
                        setTimeout(() => input.select(), 0);
                    }
                });
            });
            document.getElementById("Vnos").addEventListener("submit", function(event) {
                    event.preventDefault();
                    
                    const form = event.target;
                    const formData = new FormData(form);

                    const data = {};
                    for(const [key, value] of formData.entries()) {
                        data[key] = value;
                    }

                    fetch('/AdminVnosEN', { 
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data)
                    }).then(res => {
                        setTimeout(() => {
                            AdministracijaEndNote();
                        }, 100);
                    });
            });
        });
        //Administracija Izbris
        document.getElementById("AdminIzbris").innerHTML = '';

        let tabela = document.createElement('table');
        tabela.className = "table table-sm";
        tabela.id = "SifrantTabela"

        let tabelaHead = document.createElement('thead');
        let tabelaHeadTr = document.createElement('tr');

        //Gremo skozi imena ključev oz. imena stolpcev in jih zapišemo v head vrstico tabele
        Object.entries(data[0]).forEach(([key, value]) => {
            let tabelaHeadTd = document.createElement('th');
            tabelaHeadTd.innerHTML = key;
            tabelaHeadTr.append(tabelaHeadTd);
        });

        let tabelaHeadBtn = document.createElement('th');
        tabelaHeadTr.append(tabelaHeadBtn)

        tabelaHead.append(tabelaHeadTr);
        tabela.append(tabelaHead);

        let tabelaBody = document.createElement('tbody');

        data.forEach((data) => {
            let tr = document.createElement('tr')

            let btnDel = document.createElement('button');
            btnDel.textContent = "Izbriši";
            btnDel.onclick = function(){
                IzbrisAdmin(this);
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabendnote`;
                }
                tr.append(td);
            })

            btnTd.append(btnDel);
            tr.append(btnTd);

            tabelaBody.append(tr);
        });

        tabela.append(tabelaBody);
        document.getElementById("AdminIzbris").append(tabela);

    })
}   

function IzbrisAdmin(element){
    console.log(element.className);
    if(confirm(`Ste prepričani da želite izbrisati vnos z ID ${element.id}?`)){
        if(element.className == "tablogin"){
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    AdministracijaUporabniki();
            });
        }else if(element.className == "tabustanova"){
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    AdministracijaUstanove();
            });
        }else if(element.className == "tabos"){
            console.log("OS");
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    AdministracijaOS();
            });
        }else if(element.className == "tabendnote"){
            console.log("EndNote");
            fetch('AdminIzbris', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({"ID":element.id,"Tabela":element.className})
            }).then(res => {
                    AdministracijaEndNote();
            });
        }
    }
}
    */

window.Dashboard = Dashboard;
window.Analitika = Analitika;
window.Obrazec = Obrazec;
window.Odjava = Odjava;
window.user = user;
window.Administracija = Administracija;
window.IzbrisAdmin = IzbrisAdmin;

