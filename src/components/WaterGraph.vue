<template>
  <!-- <div>24242 {{ message }}</div> -->
  <!-- <pre>{{ SampleYear }}</pre> -->
  <!-- <pre>{{ SearchKeyword }}</pre> -->
  
  <a-form @submit="onSubmit" style="width: fit-content; margin: auto">
    <a-space align="end">
        <a-form-item label="年份" name="Year">
          <a-input-number v-model:value="SampleYear" />
        </a-form-item>
        <a-form-item label="地區" name="Keyword">
          <a-input v-model:value="SearchKeyword" />
        </a-form-item>
        <a-form-item>
          <a-button :disabled="status !== ''" type="primary" html-type="submit">
            <SearchOutlined></SearchOutlined>
          </a-button>
        </a-form-item>
    </a-space>
  </a-form>
  <div style="text-align: center;">
    <!-- <p>{{ months }}</p> -->
    <p class="months">
      <div v-for="(value, key) in months">
        <div>{{ key }} 月</div>
        <div>
          <div v-if="value == null" style="background-color: rgba(255, 206, 86, 1);">{{ status }}</div>
          <div v-else-if="value < 0" style="background-color: rgba(255, 99, 132, 1);">{{ value }}</div>
          <div v-else style="background-color: rgba(75, 192, 192, 1);">{{ value }}</div>
        </div>
        <a-button
          v-if="value != null"
          :disabled="value >= 0"
          type="text"
          @click="fetchWaterQualityMonth(
            SearchKeyword,
            SampleYear,
            key
          )"><SearchOutlined />
        </a-button>
      </div>
    </p>
    <!-- <div>已收到資料數量: {{ items.length }}</div>
    <div>已收到的請求: {{ fetchCount }}</div> -->
  </div>
  
  <WaterChart v-if="message.length" title="濁度(NTU)" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="色度(鉑鈷單位)" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="臭度(初嗅數)" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="pH值" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="自由有效餘氯mg/L" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="大腸桿菌群(CFU/100毫升)" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="總菌落數(CFU/毫升)" :message="items.slice()"></WaterChart>
  <WaterChart v-if="message.length" title="水溫(℃)" :message="items.slice()"></WaterChart>
  
  <footer>
    <a-button type="text" href="https://github.com/dwatow/TainanWaterGraph" target="_blank">
      <GithubOutlined /> to Github repo
    </a-button>
  </footer>
</template>

<script>
import backendAPI from "./../utility/backendAPI";
import WaterChart from "./WaterChart.vue";
import { SearchOutlined, GithubOutlined } from '@ant-design/icons-vue';

export default {
  name: "WaterGraph",
  components: {
    WaterChart,
    SearchOutlined,
    GithubOutlined
  },
  created() {
    this.months = Array(12).fill(1).map((o, i) => o + i)
      .reduce((result, item) => {
        result[`${item}`] = null;
        return result
      }, {})
  },
  data() {
    return {
      status: '',
      fetchCount: 0,
      message: [],
      months: {},
      SearchKeyword: "仁德",
      SampleYear: 2021,
    };
  },
  methods: {
    onSubmit() {
      this.message = [];
      this.fetchCount = 0;
      this.months = Array(12).fill(1).map((o, i) => o + i)
        .reduce((result, item) => {
          result[item] = null;
          return result
        }, {})
      this.fetchWaterQuality({
        SearchKeyword: this.SearchKeyword,
        SampleYear: this.SampleYear,
      });
    },
    parseDate(title) {
      const dateTainanFormat = title.split('|').pop().trim()
      const [year, ...monthAndDay] = dateTainanFormat.split('年')
      const [month, ...dayText] = monthAndDay.join().split('月')
      const [day, ...other] = dayText.join().split('日')
      return [year, month, day]
    },
    async fetchWaterQualityMonth(SearchKeyword, SampleYear, SampleMonth) {
      console.log(SearchKeyword, SampleYear, SampleMonth);
      this.months[SampleMonth] = null
      try {
        const res = await backendAPI.GET("/water-quality", {
          SearchKeyword,
          SampleYear,
          SampleMonth,
        });
        this.message = [...this.message, ...res.data]
        this.months[SampleMonth] = res.data.length; // success
      } catch(e) {
        console.log(e);
        this.months[SampleMonth] = -1; // false
      } finally {
        this.fetchCount += 1;
        if (this.fetchCount === 12) this.status = ''
      }

    },
    async fetchWaterQuality({ SearchKeyword, SampleYear }) {
      this.status = '查詢中...'
      Array(12)
        .fill(1)
        .map((o, i) => o + i)
        .forEach(async (SampleMonth) => {
          // await new Promise(res => setTimeout(() => res(), 500))
          await this.fetchWaterQualityMonth(SearchKeyword, SampleYear, SampleMonth)
        })
      
    },
  },
  computed: {
    items() {
      return this.message.sort((a, b) => {
        return new Date(this.parseDate(a.title)) - new Date(this.parseDate(b.title))
      })

    }
  },
  // computed: {
  //   message() {
  //     return [
  //       {
  //         title: "台南仁德區 | 2021年05月25日",
  //         data: {
  //           value: {
  //             取樣地點: "102",
  //             "濁度(NTU)": "0.20",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.6",
  //             "自由有效餘氯mg/L": "0.32",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "30.2",
  //             備註: "仁德區二行一路147號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年05月25日",
  //         data: {
  //           value: {
  //             取樣地點: "103",
  //             "濁度(NTU)": "0.20",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.8",
  //             "自由有效餘氯mg/L": "0.31",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "12",
  //             "水溫(℃)": "30.8",
  //             備註: "仁德區保安里中正路1段258號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年05月25日",
  //         data: {
  //           value: {
  //             取樣地點: "104",
  //             "濁度(NTU)": "0.35",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.6",
  //             "自由有效餘氯mg/L": "0.36",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "8",
  //             "水溫(℃)": "30.0",
  //             備註: "仁德區保安里中正路2段932號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年05月25日",
  //         data: {
  //           value: {
  //             取樣地點: "105",
  //             "濁度(NTU)": "0.25",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.5",
  //             "自由有效餘氯mg/L": "0.30",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "30.2",
  //             備註: "仁德區中山路475號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年05月03日",
  //         data: {
  //           value: {
  //             取樣地點: "103",
  //             "濁度(NTU)": "0.15",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.8",
  //             "自由有效餘氯mg/L": "0.38",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "27.4",
  //             備註: "環保監測點\n仁德區保安里中正路1段258號\n廠所自行採樣",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年01月18日",
  //         data: {
  //           value: {
  //             取樣地點: "102",
  //             "濁度(NTU)": "0.35",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.7",
  //             "自由有效餘氯mg/L": "0.54",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "20.0",
  //             備註: "仁德區二行一路147號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年01月18日",
  //         data: {
  //           value: {
  //             取樣地點: "103",
  //             "濁度(NTU)": "0.25",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.7",
  //             "自由有效餘氯mg/L": "0.53",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "19.0",
  //             備註: "仁德區保安里中正路1段258號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年01月18日",
  //         data: {
  //           value: {
  //             取樣地點: "104",
  //             "濁度(NTU)": "0.15",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.2",
  //             "自由有效餘氯mg/L": "0.53",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "20.8",
  //             備註: "仁德區保安里中正路2段932號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年01月18日",
  //         data: {
  //           value: {
  //             取樣地點: "105",
  //             "濁度(NTU)": "0.20",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.2",
  //             "自由有效餘氯mg/L": "0.47",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "20.2",
  //             備註: "仁德區中山路475號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年01月13日",
  //         data: {
  //           value: {
  //             取樣地點: "103",
  //             "濁度(NTU)": "0.20",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "7.9",
  //             "自由有效餘氯mg/L": "0.53",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "18.8",
  //             備註: "環保監測點仁德區保安里中正路1段258號廠所自行採樣",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年03月22日",
  //         data: {
  //           value: {
  //             取樣地點: "102",
  //             "濁度(NTU)": "0.35",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.0",
  //             "自由有效餘氯mg/L": "0.39",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "22.6",
  //             備註: "仁德區二行一路147號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年03月22日",
  //         data: {
  //           value: {
  //             取樣地點: "103",
  //             "濁度(NTU)": "0.45",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.2",
  //             "自由有效餘氯mg/L": "0.31",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "22.5",
  //             備註: "仁德區保安里中正路1段258號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年03月22日",
  //         data: {
  //           value: {
  //             取樣地點: "104",
  //             "濁度(NTU)": "0.40",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.0",
  //             "自由有效餘氯mg/L": "0.47",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "21.8",
  //             備註: "仁德區保安里中正路2段932號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年03月22日",
  //         data: {
  //           value: {
  //             取樣地點: "105",
  //             "濁度(NTU)": "0.20",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.0",
  //             "自由有效餘氯mg/L": "0.30",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "24.6",
  //             備註: "仁德區中山路475號",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //       {
  //         title: "台南仁德區 | 2021年03月10日",
  //         data: {
  //           value: {
  //             取樣地點: "103",
  //             "濁度(NTU)": "0.70",
  //             "色度(鉑鈷單位)": "<5",
  //             "臭度(初嗅數)": "無",
  //             pH值: "8.0",
  //             "自由有效餘氯mg/L": "0.47",
  //             "大腸桿菌群(CFU/100毫升)": "<1",
  //             "總菌落數(CFU/毫升)": "<1",
  //             "水溫(℃)": "23.6",
  //             備註: "環保監測點\n仁德區保安里中正路1段258號\n廠所自行採樣",
  //           },
  //           spec: {
  //             取樣地點: "編號",
  //             "濁度(NTU)": "2",
  //             "色度(鉑鈷單位)": "5",
  //             "臭度(初嗅數)": "3",
  //             pH值: "6.0-8.5",
  //             "自由有效餘氯mg/L": "0.2-1.0",
  //             "大腸桿菌群(CFU/100毫升)": "6",
  //             "總菌落數(CFU/毫升)": "100",
  //             "水溫(℃)": "--",
  //             備註: "地點",
  //           },
  //         },
  //       },
  //     ];
  //   },
  // }
};
</script>

<style lang="scss" scoped>
.months {
  display: flex;
  flex-wrap: nowrap;
  * {
    flex: 1 1 auto;
  }
}

footer {
  text-align: center;
}
</style>