import axios from 'axios';

export default class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '31127704-edd5a630e2fb0506821f4d56d';

  page = 1;
  query = null;
  itemsPerPage = 40;

  fetchPhotos() {
    return axios.get(`${this.#BASE_URL}`, {
      params: {
        key: this.#API_KEY,
        q: this.query,
        page: this.page,
        per_page: this.itemsPerPage,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    });
  }
}
