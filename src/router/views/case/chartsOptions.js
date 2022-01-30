const chartRevenueHistory = {
    options: {
        chart: {
            height: 380,
            type: 'line',
            zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true
              },
              toolbar: {
                autoSelected: 'zoom'
              }
        },
        colors: ['#556ee6', '#34c38f'],
        dataLabels: {
            enabled: false
          },
        stroke: {
            width: [3, 3],
            curve: 'smooth'
        },
        forecastDataPoints: {
            count: 2
          },
        title: {
            text: 'Réalisé et Projection',
            align: 'left',
            style: {
                fontWeight: '500',
            },
        },
        grid: {
            row: {
                colors: ['transparent', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.2
            },
            borderColor: '#f1f1f1'
        },
        xaxis: {
            type: 'datetime',           
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                  return ((val / 1000).toFixed(0)+"k€");
                },
              },
            min: 0,
            max: 1000000,
        },

        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -25,
            offsetX: -5
        },
        responsive: [{
            breakpoint: 600,
            options: {
                chart: {
                    toolbar: {
                        show: true
                    }
                },
                legend: {
                    show: true
                },
            }
        }],
    },
    tooltip: {
        x: {
          format: "dd MMM yyyy"
        },
    },
    series: [],
};
export { chartRevenueHistory };