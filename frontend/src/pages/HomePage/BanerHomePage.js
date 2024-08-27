import React from 'react';
import './BanerHomePage.css';

const BanerHomePage = () => {
	return (
		<>
			<div className='home-baner'>
				<img
					src={`${process.env.PUBLIC_URL}/images/home_baner_poleed.png`}
					alt='Baner POLEEDucation'
				/>
			</div>
		</>
	);
};

export default BanerHomePage;
