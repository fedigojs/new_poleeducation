import Header from '../../layouts/Header';
import { TestExercise } from '../../components/exercise_test/TestExercise';
import Layout from '../../layouts/Layout';

const TestExerciseHomePage = () => {
	return (
		<Layout>
			<Header />
			<TestExercise />
		</Layout>
	);
};

export default TestExerciseHomePage;
