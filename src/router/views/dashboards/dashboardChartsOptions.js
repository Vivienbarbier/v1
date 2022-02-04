const dashboardChartsOptions = {
  chartOptions: {
        chart: {
            height: 380,
            type: 'area',
            zoom: {
                type: 'x',
                enabled: true,
                autoScaleYaxis: true
              },
              dropShadow: {
                enabled: true,
                color: "#000",
                top: 18,
                left: 7,
                blur: 8,
                opacity: 0.2,
              },
              toolbar: {
                autoSelected: 'zoom'
              }
        },
        colors: ["#556ee6", "#f1b44c"],
        dataLabels: {
            enabled: false
          },
        stroke: {
            width: [3, 3],
            curve: 'smooth'
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [20, 100, 100, 100],
          },
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
        },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            floating: true,
            offsetY: -15,
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
      tooltip: {
          x: {
            format: "dd MMM yyyy"
          },
      },
  },
    series: [
        {name : "Chiffre d'affaires", data :[]},
        {name : "Marge", data :[] }
      ],
}



const caseTypePieChart = {
    series: [],
    chartOptions: {
      chart: {
          type: 'donut',
          height: 240,
      },
      fill: {
        opacity: 0.8,
      },
      labels: ['PE', 'TC', 'TLE','CCO', '-'],
      colors: ['#556ee6', '#34c38f', '#f46a6a',  '#f46a00','#aaaaaa'],
      legend: {
          show: true,
      },
      plotOptions: {
          pie: {
              donut: {
                  size: '70%',
              }
          }
        }
      }  
  }


const caseStatusHistogram = {
    chartOptions: {
        chart: {
          stacked: true,
          toolbar: {
            show: false,
          },
          zoom: {
            enabled: true,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            endingShape: "rounded",
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          categories: [
            "Qualifié",
            "Planifié",
            "Préparé",
            "En attente",
            "En cours",
            "Terminé",
            "Cloturé" ,
            "-"          
          ],
        },
        colors: ['#556ee6', '#34c38f', '#f46a6a',  '#f46a00','#aaaaaa'],
        legend: {
          position: "right",
        },
        fill: {
          opacity: 0.8,
        },
      },
      series : null,
}

export { dashboardChartsOptions, caseTypePieChart, caseStatusHistogram };