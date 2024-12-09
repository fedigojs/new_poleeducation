import React from 'react';
import { Table } from 'antd';
import styles from './styles.module.css';

const CustomTable = ({
	title,
	dataSource,
	columns,
	rowKey = 'id',
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
				rowKey={rowKey}
				pagination={{
					pageSize: minRows,
				}}
				{...rest}
			/>
		</div>
	);
};

export default CustomTable;
