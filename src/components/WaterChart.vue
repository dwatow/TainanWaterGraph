<template>
  <LineChart v-if="message.length" :title="title" :items="items" :xAxisLabel="xAxisLabel"></LineChart>
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
      return [...this.message.reduce((result, item) => {
        result.add(item.title)
        return result
      }, new Set()).values()]
    },
    items() {
      return this.message.reduce((result, item) => {
        if (this.title !== '') {
          // value
          result[0] = {
            label: `取樣值: ${this.title}`,
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
          const spec = this.parseSpec(item.data.spec[this.title])
          // console.log(spec, this.title);

          spec.forEach((spec, index) => {
            console.log('spec', spec, this.title);
            result[index+1] = {
              label: `標準值: ${this.title}`,
              data: [
                ...result[index+1].data,
                spec
              ],
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