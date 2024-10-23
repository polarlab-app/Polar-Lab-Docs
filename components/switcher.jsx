'use client';
import styles from '@/src/css/docs/switcher.module.scss';
import { useTheme } from './themeProvider';
import findPageDocs from '@/lib/findPageDocs';
import { useEffect, useState } from 'react';

export default function Switcher({ params }) {
	const { theme } = useTheme();

	return (
		<div className={`${styles.container} ${styles[theme]}`}>
			<div className={styles.button}>
				<i className={`${styles.icon} icon-angle-up`}></i>
				<div className={styles.textContainer}>
					<p className={styles.text}>Commands</p>
					<p className={styles.text}>Last Page</p>
				</div>
			</div>
			<div className={styles.button}>
				<div className={styles.textContainer}>
					<p className={styles.text}>Commands</p>
					<p className={styles.text}>Next Page</p>
				</div>
				<i className={`${styles.icon} icon-angle-up`}></i>
			</div>
		</div>
	);
}
