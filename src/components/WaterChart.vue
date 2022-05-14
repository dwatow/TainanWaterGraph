<template>
  <LineChart v-if="status" :title="title" :items="items" :xAxisLabel="xAxisLabel"></LineChart>
  <!-- <div v-for="item in items">{{ item.data }}</div> -->
</template>

<script>
import LineChart from "./LineChart.vue";

export default {
  name: 'WaterChart',
  components: {
    LineChart,
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: Array,
      required: true
    },
  },
  data() {
    return {
      status: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.status = true;
      // console.log('this.status', this.status);
    })
  },
  watch: {
    message() {
      this.status = false;
      // console.log('this.status', this.status);
    }
  },
  updated() {
    this.$nextTick(() => {
      this.status = true;
      // console.log('this.status', this.status);
    })
  },
  methods: {
    parseValue(value) {
      if (value.includes('<')) return parseFloat(value.split('<').join(''))
      if (value === '無') return parseFloat(0)
      return value;
    },
    parseSpec(value) {
      if (value === '無') return [parseFloat(0)]
      if (value === '--') return []
      if (value.includes('<')) return [parseFloat(value.split('<').join(''))]
      if (value.includes('-')) return value.split('-').map(value => parseFloat(value))

      return [value];
    }
  },
  computed: {
    xAxisLabel() {
      return this.message.map(item => item.title)
      // return [...this.message.reduce((result, item) => {
      //   result.add(item.title)
      //   return result
      // }, new Set()).values()]
    },
    items() {
      return this.message
      .reduce((result, item) => {
        if (this.title !== '') {
          // value
          result[0] = {
            label: `取樣值`,
            data: [
              ...result[0].data,
              this.parseValue(item.data.value[this.title])
            ],
            location: [
              ...result[0].location,
              item.data.value["備註"]
            ]
          }
          // spec
          const spec_list = this.parseSpec(item.data.spec[this.title])
          // console.log(spec, this.title);

          const fillstyle = spec_list.length === 2 ? [
            '+1', '+1'
          ]: [false, false]

          spec_list.forEach((spec, index) => {
            // console.log('spec', spec_list, fillstyle);
            result[index+1] = {
              label: `標準值`,
              data: [
                ...result[index+1].data,
                spec
              ],
              fill: fillstyle[index],
              location: [
                ...result[index+1].location,
                item.data.value["備註"]
              ]
            }
          })
        }
        return result
      }, [{ data: [], location:[] }, { data: [], location:[] }, { data: [], location:[] }])
    },
  },
}
</script>

<style lang="scss" scoped>

</style>