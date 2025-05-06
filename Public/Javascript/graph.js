Chart.register(ChartDataLabels);

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
                    display: true
                }
            },
            plugins:{
                legend: {
                    display: false
                },
                datalabels: {
                    display: false
                }
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
        borderWidth: 0.5
        }]
    },
    options: {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color:'rgb(0, 0, 0)',
                    font: {
                        size: 14,
                        family: 'Arial'
                    },
                    boxWidth: 20
                },
                display: true
            },
            title: {
                display: false
            },
            datalabels: {
                display: true, // omogoči prikaz številk
                color: '#fff', // barva številk
                font: {
                  weight: 'bold',
                  size: 16,
                },
                formatter: (value) => {
                    return value; // prikaži samo vrednosti, lahko dodaš formatiranje
                  }
            },
        },
        layout: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
        }},
        responsive: true,
        cutout: '50%'
    }
    });
}