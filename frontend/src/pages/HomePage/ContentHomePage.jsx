import React from 'react';
import styles from './ContentHomePage.module.scss';

const ContentHomePage = () => {
	return (
		<div className={`container ${styles.home_page}`}>
			<div className={styles.container_h1}>
				<h1 className={styles.oswald_main_h1}>СУЧАСНА ПЛАТФОРМА</h1>
				<h1 className={styles.oswald_main_h1}>для тренерів</h1>
			</div>
		</div>
	);
};

export default ContentHomePage;
