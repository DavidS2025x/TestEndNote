export function chartBar(data,label,ctx){
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                data: data,
                backgroundColor: 'rgba(77, 231, 255, 1)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: [{
                    beginAtZero: true,
                    display: true,
                    ticks: {
                    stepSize: 1,
                    min: 0
                    }
                }],
                x: {
                    display: false
                }
            },
            legend: {
                display: false
            }
        }
    });
}

export function chartPie(data, label, ctx){
    return new Chart(ctx, {
    type: 'pie',
    data: {
        labels: label,
        datasets: [{
        label: 'Stevilo OS',
        data: data,
        backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1
        }]
    },
    options: {
        responsive: true
    }
    });
}