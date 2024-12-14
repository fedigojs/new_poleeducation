import React from 'react';
import PropTypes from 'prop-types';
// import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            <main className="flex-grow-1">{children}</main>
            {/* <Footer /> */}
        </div>
    );
};
Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
