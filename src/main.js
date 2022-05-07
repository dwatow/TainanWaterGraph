import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

const app = createApp(App)
// console.log(app.config);
app.use(Antd);



app.config.errorHandler = (err) => {
    /* handle error */
    console.error('handle error', err)
}
app.config.warnHandler = (err) => {
    /* handle warn */
    console.warn('handle warn', err)
}
app.mount('#app')

