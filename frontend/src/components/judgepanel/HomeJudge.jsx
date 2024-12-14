import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const HomeJudge = () => {
    const { user, error } = useContext(AuthContext);

    return (
        <div className="home-admin">
            {user ? (
                <div>
                    <h1>
                        Ласкаво просимо, {user.firstName} {user.lastName} !
                    </h1>
                    <p>Ваша роль: {user.roleName}</p>
                    {/* Здесь могут быть добавлены другие компоненты или информация */}
                </div>
            ) : (
                <p>Аутентификация...</p>
            )}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default HomeJudge;
