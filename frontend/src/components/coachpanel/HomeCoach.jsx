import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Container, Col } from 'react-bootstrap';

const HomeCoach = () => {
    const { user, error } = useContext(AuthContext);

    return (
        <div className="home-admin">
            <Container>
                <Col>
                    <h1 className="text-center">
                        Ласкаво просимо, {user.firstName} {user.lastName} !
                    </h1>
                </Col>
                {/* Здесь могут быть добавлены другие компоненты или информация */}
            </Container>

            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default HomeCoach;
