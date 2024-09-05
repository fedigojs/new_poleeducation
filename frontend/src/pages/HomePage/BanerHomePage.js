import React from 'react';
import './BanerHomePage.css';

const BanerHomePage = () => {
	return (
		<>
			<div className='home-baner'>
				<img
					src={`${process.env.PUBLIC_URL}/images/baner_poleeducation.png`}
					alt='Baner POLEEDucation'
				/>
			</div>
		</>
	);
};

export default BanerHomePage;
