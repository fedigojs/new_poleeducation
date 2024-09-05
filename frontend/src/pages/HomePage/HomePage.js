import React from 'react';
import Header from '../../layouts/Header';
import TimingHomePage from './TimingHomePage';
import Layout from '../../layouts/Layout';

const HomePage = () => {
	return (
		<Layout>
			<Header />
			<TimingHomePage />
		</Layout>
	);
};

export default HomePage;
