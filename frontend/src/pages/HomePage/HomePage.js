import React from 'react';
import Header from '../../layouts/Header';
import BanerHomePage from './BanerHomePage';
import TimingHomePage from './TimingHomePage';
import Footer from '../../layouts/Footer';

const HomePage = () => {
	return (
		<>
			<Header />
			<BanerHomePage />
			<TimingHomePage />
			<Footer />
		</>
	);
};

export default HomePage;
