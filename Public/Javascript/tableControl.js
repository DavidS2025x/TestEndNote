export function iskanjeTabela(iskalnoPolje,tabela) {
    // Declare variables
    let input, filter, table, tr, td, txtValue, matchFound;

    input = iskalnoPolje;
    filter = input.value.toUpperCase();

    table = tabela;
    tr = table.getElementsByTagName("tr");
  
    //Preišči vse vrstice v tabeli
    for (let i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");
        matchFound = false;
        //Preišči vse vnose v vrstici
        for(let j = 0; j < td.length; j++){
            //Če obstaja preveri vrednost
            if(td[j]){
                //Preberi vrednost vnosa in ga shrani v txtValue
                txtValue = td[j].textContent || td[j].innerText;
                //Če najdemo ujemanje nastavimo matchFound na true in prekinemo zanko
                if(txtValue.toUpperCase().indexOf(filter) > -1){
                    matchFound = true;
                    break;
                }
            }
        }
        //Če smo v vrstici našli ujemanje nastavimo display nastavitve na "", da se vrstica lahko prikaže, če ujemanja nismo našli pa nastavimo na "none" da se vrstica ne pokaže
        if(matchFound){
            console.log("Nastavljam na prikaz");
            tr[i].style.display = "";
        }else{
            console.log("Nastavljam na prikaz");
            tr[i].style.display = "none";
        }
    }
  }