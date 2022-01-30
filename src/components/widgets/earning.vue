<script>
import Loader from "./loader";

/**
 * Monthly-Earning component
 */
export default {
  components: {
    Loader,
  },
  data() {
    return {
      chartOptions: {
        chart: {
          height: 200,
          type: "radialBar",
          offsetY: -10,
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
              name: {
                fontSize: "13px",
                color: undefined,
                offsetY: 60,
              },
              value: {
                offsetY: 22,
                fontSize: "16px",
                color: undefined,
                formatter: function (val) {
                  return val + "%";
                },
              },
            },
          },
        },
        colors: ["#556ee6"],
        fill: {
          type: "gradient",
          gradient: {
            shade: "dark",
            shadeIntensity: 0.15,
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 65, 91],
          },
        },
        stroke: {
          dashArray: 4,
        },
        labels: ["Projection M-1"],
      },
      series: [67],
    };
  },
  props: {
    updating: {
      type: Boolean,
    },
  },
};
</script>

<template>
  <Loader :loading="updating">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title mb-4">Résultat du mois</h4>
        <div class="row">
          <div class="col-sm-6">
            <p class="text-muted">Chiffre d'affaire</p>
            <h3>34 205 €</h3>
            <p class="text-muted">
              <span class="text-success me-2">
                +12%
                <i class="mdi mdi-arrow-up"></i>
              </span>
              par rapport au mois dernier.
            </p>

            <div class="mt-4">
              <a href="javascript: void(0);" class="btn btn-primary btn-sm">
                Détails
                <i class="mdi mdi-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
          <div class="col-sm-6">
            <!-- Chart -->
            <apexchart
              class="apex-charts"
              type="radialBar"
              height="200"
              dir="ltr"
              :series="series"
              :options="chartOptions"
            ></apexchart>
          </div>
        </div>
      </div>
    </div>
  </Loader>
</template>