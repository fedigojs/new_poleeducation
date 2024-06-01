// AppRoutes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './features/auth/Login';
import AdminPage from './features/dashboard/AdminPage';
import JudgePage from './features/dashboard/JudgePage';
import AddUserPage from './components/adminpanel/AddUserPage';
import HomePage from './pages/HomePage/HomePage';
import AddAthletesPage from './components/adminpanel/AddAthletesPage';
import HomeAdmin from './components/adminpanel/HomeAdmin';
import AddCompetitionPage from './components/adminpanel/AddCompetition';
import RegisterAthletePage from './components/adminpanel/RegisterAthletePage';
import AthletesDraw from './components/adminpanel/AthletesDraw';
import AthletesDrawJudge from './components/judgepanel/AthletesDrawJudge';
import HomeJudge from './components/judgepanel/HomeJudge';

const AppRoutes = () => (
	<Router>
		<Routes>
			<Route
				path='/'
				element={<HomePage />}
			/>
			<Route
				path='/login'
				element={<Login />}
			/>
			<Route
				path='/admin/*'
				element={
					<ProtectedRoute>
						<AdminPage />
					</ProtectedRoute>
				}>
				<Route
					path=''
					element={<HomeAdmin />}
				/>
				<Route
					path='add-user'
					element={<AddUserPage />}
				/>
				<Route
					path='add-athletes'
					element={<AddAthletesPage />}
				/>
				<Route
					path='add-competition'
					element={<AddCompetitionPage />}
				/>
				<Route
					path='register-athletes'
					element={<RegisterAthletePage />}
				/>
				<Route
					path='athletes-draw'
					element={<AthletesDraw />}
				/>
			</Route>
			<Route
				path='/judge/*'
				element={
					<ProtectedRoute>
						<JudgePage />
					</ProtectedRoute>
				}>
				<Route
					path=''
					element={<HomeJudge />}
				/>
				<Route
					path='athletes-draw'
					element={<AthletesDrawJudge />}
				/>
			</Route>
		</Routes>
	</Router>
);

export default AppRoutes;
