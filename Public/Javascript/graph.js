export function chartBar(data,label,ctx){
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                data: data,
                backgroundColor: '#ba0559',
                borderColor: '#ba0559',
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
            '#34095c',
            '#670062',
            '#940060',
            '#ba0559',
            '#da304c',
            '#f0563b'
        ],
        borderColor: [
            '#34095c',
            '#670062',
            '#940060',
            '#ba0559',
            '#da304c',
            '#f0563b'
        ],
        borderWidth: 1
        }]
    },
    options: {
        responsive: true
    }
    });
}