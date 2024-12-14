import React from 'react';
import Header from '../../layouts/Header';
import Layout from '../../layouts/Layout';
import ContentHomePage from './ContentHomePage';
import styles from './HomePage.module.scss';

const HomePage = () => {
    return (
        <>
            <div className={styles.background_color}>
                <Layout>
                    <div className={styles.background_image}></div>
                    <Header />
                    <ContentHomePage />
                </Layout>
            </div>
        </>
    );
};

export default HomePage;
