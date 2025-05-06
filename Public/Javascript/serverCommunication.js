export async function askServer(serverQuestion, optionalOrder = '{"ID":"0"}'){
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    return await fetch(serverQuestion, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: optionalOrder,
    signal:controller.signal
    }).then(response =>{
        clearTimeout(id);
        return response
    })
    .catch(err => {
        clearTimeout(id)
        if(err.name === 'AbortError'){
            console.error('Zahteva je bila prekinjena');
        }else{
            console.error('Napaka pri pošiljanju:', err);
        }
        return null;
    });
}

export async function orderServer(serverOrder,orderContents,orderType) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    let response;
    if(orderType == "vnesi"){
        response = await fetch(serverOrder, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: orderContents
        });
        clearTimeout(id);
    }else if(orderType == "uredi"){
        response = await fetch(serverOrder, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: orderContents
        });
        clearTimeout(id);
    }else if(orderType == "izbrisi"){
        response = await fetch(serverOrder, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: orderContents
        });
        clearTimeout(id);
    }
    return await response;
}