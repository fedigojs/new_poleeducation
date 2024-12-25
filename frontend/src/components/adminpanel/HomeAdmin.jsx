import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Layout } from 'antd';
import '../../styles/global.scss';

const HomeAdmin = () => {
    const { user, error } = useContext(AuthContext);

    return (
        <Layout className="layout">
            <div className="home-admin">
                {user ? (
                    <div>
                        <h1>
                            Добро пожаловать, {user.firstName} {user.lastName} !
                        </h1>
                        <p>Ваша роль: {user.roleName}</p>
                        {/* Здесь могут быть добавлены другие компоненты или информация */}
                    </div>
                ) : (
                    <p>Аутентификация...</p>
                )}
                {error && <p className="error-message">{error}</p>}
            </div>
        </Layout>
    );
};

export default HomeAdmin;
