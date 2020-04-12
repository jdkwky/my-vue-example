import axios from 'axios';

const service = axios.create({
    baseURL: 'http://test.api.com',
    timeout: 500
});


service.interceptors.request.use(config => config, error => {
    console.log(error);

});

service.interceptors.response.use(response => response, error => {
    console.log(error);

})
export default service;