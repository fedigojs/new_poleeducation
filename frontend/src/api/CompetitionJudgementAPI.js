import APIWrapper from './APIWrapper';

class CompetitionJudgementAPI extends APIWrapper {
	constructor() {
		super('/api/draw-judgement');
	}

	listAllJudgement = () => this.get({ url: '/all' });

	listJudgementByCoach = (userId) => this.get({ url: `/by-coach/${userId}` });
}

export default new CompetitionJudgementAPI();
