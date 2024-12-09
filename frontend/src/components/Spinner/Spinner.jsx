import React from 'react';
import { Spin } from 'antd';
import styles from './styles.module.css';

const Spinner = () => {
	return (
		<div className={styles.spinnerContainer}>
			<Spin size='large' />
		</div>
	);
};

export default Spinner;
