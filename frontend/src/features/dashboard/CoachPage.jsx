import React from 'react';
import { Outlet } from 'react-router-dom';
import Menu from '../../components/Menu/Menu';

const CoachPage = () => {
    const menuItems = [
        { path: '/coach/add-athlete-coach', label: 'Спортсмени' },
        { path: '/coach/add-registration', label: 'Реєстрація на змаганнях' },
        { path: '/coach/athletes-competitions', label: 'Змагання' },
    ];

    return (
        <>
            <Menu menuItems={menuItems} brandLink="/coach" />
            <div className="content">
                <Outlet />
            </div>
        </>
    );
};

export default CoachPage;
