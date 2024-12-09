// APIWrapper.js
import api from './api';

class APIWrapper {
	constructor(baseURL = '') {
		this.baseURL = baseURL;
	}

	async request({ method, url, data, config = {}, completeUrl = null }) {
		const finalUrl = completeUrl || `${this.baseURL}${url}`;

		return await api({ method, url: finalUrl, data, ...config }).then(
			({ data }) => data
		);
	}

	async get(params) {
		return this.request({ ...params, method: 'get' });
	}

	async post(params) {
		return this.request({ ...params, method: 'post' });
	}

	async put(params) {
		return this.request({ ...params, method: 'put' });
	}

	async delete(params) {
		return this.request({ ...params, method: 'delete' });
	}

	async patch(params) {
		return this.request({ ...params, method: 'patch' });
	}
}

export default APIWrapper;
