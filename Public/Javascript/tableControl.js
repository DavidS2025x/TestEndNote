export function iskanjeTabela(iskalnoPolje,tabela) {
    //Naredimo spremenljivke
    let filter, tr, td, txtValue, matchFound;

    //Vsebino iskalnega polja prepišemo v filter
    filter = iskalnoPolje.value.toUpperCase();

    //V tr shranimo polje vseh tr elementov tabele
    tr = tabela.getElementsByTagName("tr");
  
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
            tr[i].style.display = "";
        }else{
            tr[i].style.display = "none";
        }
    }
  }