import axios from 'axios';

const backendAPI = axios.create({
  baseURL: 'https://my-god-render.onrender.com'
})

export default {
  GET(url, params) {
    return backendAPI.get(url, {
      params
    })
  // },
  // async promiseGET(url, params) {
  //   try {
  //     return await backendAPI.get(url, {
  //       params
  //     })
  //   } catch (error) {
  //     return await backendAPI.get(url, {
  //       params
  //     })
  //   }
  }
}
