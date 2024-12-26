import React from 'react';
import { Table } from 'antd';
import styles from './styles.module.css';
import PropTypes from 'prop-types';

const CustomTable = ({
    title,
    dataSource,
    columns,
    rowKey = 'key',
    minRows = 50,
    ...rest
}) => {
    return (
        <div className={styles.wrapper}>
            {title && <h1 className={styles.title}>{title}</h1>}
            <Table
                className={styles.table}
                dataSource={dataSource}
                columns={columns}
                scroll={{ x: 600 }}
                pagination={{
                    pageSize: minRows,
                }}
                {...rest}
            />
        </div>
    );
};

CustomTable.propTypes = {
    title: PropTypes.string,
    dataSource: PropTypes.array.isRequired,
    columns: PropTypes.array.isRequired,
    rowKey: PropTypes.string,
    minRows: PropTypes.number,
};

export default CustomTable;
