<template>
  <div>
    <canvas class="chart" ref="chart" height="400"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: "LineChart",
  props: {
    title: {
      type: String,
      default: ''
    },
    items: {
      type: Array,
      default: () => ([{
        data: [12, 19, 3, 5, 2, 3]
      }])
    },
    xAxisLabel: {
      type: Array,
      default: () => ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange']
    },
  },
  mounted() {
    this.chart = this.initChart({
      labels: this.xAxisLabel,
      datasets: this.datasets,
    })
  },
  data() {
    return {
      chart: null
    }
  },
  methods: {
    initChart(data) {
      const canvas = this.$refs.chart;
      return new Chart(canvas.getContext('2d'), {
      type: 'line',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: this.title,
            fullSize: true,
          },
          tooltip: {
            callbacks: {
              label: ({ dataset, dataIndex}) => `${dataset.data[dataIndex]} (${dataset.location[dataIndex]})`
            }
          }
        }
      }
    })
    },
    radom(max){
      return Math.floor(Math.random()*max);
    }
  },
  // updated() {
  //   console.log('update');
  //   this.chart.afterDestroy()
  //   this.chart = this.initChart({
  //     labels: this.xAxisLabel,
  //     datasets: this.datasets,
  //   })
    // this.chart.update(); 
  // },
  beforeDestroy() {
    this.chart.destroy()
  },
  // watch: {
  //   items(value) {
  //     console.log('watch items', this.chart);
  //     setTimeout(() => {
  //       this.chart.data.datasets = this.datasets;
  //       this.chart.update()
  //     }, 100)
  //   }
  // },
  computed: {
    datasets() {
      return this.items
        .filter(item => item.data.length)
        .map(item => ({
          ...item,
          borderColor: [
            `rgb(${this.radom(255)}, ${this.radom(255)}, ${this.radom(255)})`
          ],
          borderWidth: 1
        }))
    }
  },
};
</script>

<style lang="scss" scoped>
.color {
 color: rgba(255, 99, 132, 1);
 color: rgba(54, 162, 235, 1);
 color: rgba(255, 206, 86, 1);
 color: rgba(75, 192, 192, 1);
 color: rgba(153, 102, 255, 1);
 color: rgba(255, 159, 64, 1);
}
</style>