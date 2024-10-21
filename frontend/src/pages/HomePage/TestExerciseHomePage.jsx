import React from 'react';
import Header from '../../layouts/Header';
import { TestExercise } from '../../components/exercise_test/TestExercise';
import Layout from '../../layouts/Layout';
import styles from './HomePage.module.scss';

const TestExerciseHomePage = () => {
	return (
		<Layout>
			<Header className={styles.background_color_menu} />
			<TestExercise />
		</Layout>
	);
};

export default TestExerciseHomePage;
