import APIWrapper from './APIWrapper';

class CompetitionJudgementAPI extends APIWrapper {
	constructor() {
		super('/api/');
	}

	listAllJudgement = () => this.get({ url: '/all' });

	getCapabilitiesByPersonId = (personId) =>
		this.get({ url: `/by/${personId}` });

	getMyCapabilities = () => this.get({ url: '/my' });

	createPersonAccess = (data) => this.post({ url: '/person', data });

	createWorkerPositionAccess = (data) =>
		this.post({ url: '/worker_position', data });

	listPersons = (params) => this.get({ url: '/person', config: { params } });

	listDepartments = (params) =>
		this.get({ url: '/departments', config: { params } });
}

export default new CapabilitiesAPI();
