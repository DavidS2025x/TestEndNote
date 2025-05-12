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
                        let username = document.getElementById("username").value;
                        let email = document.getElementById("email").value;
                        let EndNoteV = document.getElementById("EndNoteV").value;
                        let OS = document.getElementById("OS").value;
                        let Ustanova = document.getElementById("Ustanova").value;
                        let Datum = document.getElementById("Datum").value;

                        if(document.getElementById('StopnjaStudija').disabled){
                            novVnos({"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":"","username":username,"email":email,"EndNoteV":EndNoteV,"OS":OS,"Ustanova":Ustanova,"Datum":Datum});
                            Obrazec();
                        }else{
                            novVnos({"Ime":Ime,"Priimek":Priimek,"Spol":Spol,"StatusUporabnika":StatusUporabnika,"StopnjaStudija":StopnjaStudija,"username":username,"email":email,"EndNoteV":EndNoteV,"OS":OS,"Ustanova":Ustanova,"Datum":Datum});
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
                        option.value = value.Kratica;
                        option.textContent = value.Kratica;
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
                    let username = document.createElement("option");
                    username.value = result.ID;
                    username.innerHTML = result.username;

                    document.getElementById("username").appendChild(username);
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

    askServer("pridobiVnos",`{"ID":"${IdVnosa}"}`)
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
                    //document.getElementById("username").value = result.OznakaSkrbnika;
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
                        document.getElementById("username").value = result.ID;
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
                        option.value = value.Kratica;
                        option.textContent = value.Kratica;
                        target.appendChild(option);
                    });
                    document.getElementById("Ustanova").value = result.Ustanova;
                });

                user().then(result => {
                    let username = document.createElement("option");
                    username.value = result.ID;
                    username.innerHTML = result.username;

                    document.getElementById("username").appendChild(username);
                })

                document.getElementById("Ime").value = result.Ime;
                document.getElementById("Priimek").value = result.Priimek;
                document.getElementById("Spol").value = result.Spol;
                document.getElementById("username").value = result.OznakaSkrbnika;
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
                IzbrisVnosa(document.getElementById(this.id),document.getElementById(this.className));
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabLogin`;
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
                IzbrisVnosa(document.getElementById(this.id),document.getElementById(this.className));
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabUstanove`;
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
                IzbrisVnosa(document.getElementById(this.className));
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabOS`;
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
                IzbrisVnosa(document.getElementById(this.className));
            }

            let btnTd = document.createElement('td');

            Object.entries(data).forEach(([key, value]) => {
                let td = document.createElement('td');
                td.textContent = `${value}`;
                if(btnDel.id == ''){
                    btnDel.id = `${value}`;
                    btnDel.className = `tabEndNote`;
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

window.Dashboard = Dashboard;
window.Analitika = Analitika;
window.Obrazec = Obrazec;
window.Odjava = Odjava;
window.user = user;
window.Administracija = Administracija;
window.AdministracijaUporabniki = AdministracijaUporabniki;
window.AdministracijaUstanove = AdministracijaUstanove; 
window.AdministracijaOS = AdministracijaOS;
window.AdministracijaEndNote = AdministracijaEndNote;
