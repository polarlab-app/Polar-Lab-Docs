'use client';
import { useTheme } from '@/components/themeProvider';
import { useViewport } from '@/components/viewportProvider';
import { useState, useEffect, useRef } from 'react';
import findDoc from '@/lib/findDoc';
import styles from '@/src/css/docs/doc.module.scss';
import Image from 'next/image';

export default function Page({ params }) {
	const { theme } = useTheme();
	const [document, setDocument] = useState(null);
	const subheadingRefs = useRef([]);
	const docRef = useRef(null);
	const { setCurrentView } = useViewport();
	const joinedParams = [params.project, params.category, params.page];

	useEffect(() => {
		const fetchDocument = async () => {
			const res = await findDoc(joinedParams.join('/'));
			if (res == 'none') window.location.href = '/';
			const parsedDoc = await JSON.parse(res);
			setDocument(parsedDoc);

			const subheading = parsedDoc.content[0].match(/&h2;(.*?)&\/h2;/);
			console.log(subheading);
			setCurrentView(subheading[1].toLowerCase().replace(' ', '-'));
		};

		fetchDocument();
	}, [setCurrentView]);

	useEffect(() => {
		const handleScroll = () => {
			const subheadings = subheadingRefs.current;
			let currentId = '';

			subheadings.forEach((ref) => {
				if (ref) {
					const rect = ref.getBoundingClientRect();
					const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

					if (isVisible) {
						const isScrollingDown = rect.top < window.innerHeight * 0.4;
						if (isScrollingDown) {
							currentId = ref.id;
						} else if (!currentId) {
							currentId = ref.id;
						}
					}
				}
			});

			if (currentId) {
				setCurrentView(currentId);
			}
		};

		const docElement = docRef.current;
		if (docElement) {
			docElement.addEventListener('scroll', handleScroll);
		}

		return () => {
			if (docElement) {
				docElement.removeEventListener('scroll', handleScroll);
			}
		};
	}, [document, setCurrentView]);

	const parseContent = (content) => {
		const regex = /&(\w+);(.*?)&\/\1;/g;
		let match;
		const elements = [];

		const formatText = (text) => {
			return text
				.replace(/&b;(.*?)&\/b;/g, `<span class=${styles.bold}>$1</span>`)
				.replace(/&i;(.*?)&\/i;/g, `<span class=${styles.italic}>$1</span>`)
				.replace(/&code;(.*?)&\/code;/g, `<span class=${styles.code}>$1</span>`)
				.replace(/&link;(.*?);(.*?)&\/link;/g, `<a href="$1">$2</a>`);
		};

		while ((match = regex.exec(content)) !== null) {
			const [, elementType, innerContent] = match;

			if (elementType === 'h1') {
				elements.push(<h1 className={styles.heading}>{formatText(innerContent)}</h1>);
			} else if (elementType === 'h1d') {
				elements.push(<hr className={styles.headingDivider}></hr>);
			} else if (elementType == 'h2') {
				elements.push(
					<h2
						className={styles.subheading}
						id={innerContent.toLowerCase().replace(' ', '-')}
						ref={(el) => subheadingRefs.current.push(el)}
					>
						{formatText(innerContent)}
					</h2>
				);
			} else if (elementType == 'h2d') {
				elements.push(<hr className={styles.subheadingDivider}></hr>);
			} else if (elementType === 'h3') {
				elements.push(<h3 className={styles.subheading}>{formatText(innerContent)}</h3>);
			} else if (elementType === 'p') {
				elements.push(<p className={styles.text}>{formatText(innerContent)}</p>);
			} else if (elementType == 'ul') {
				const listItems = innerContent.split(':').map((item, index) => (
					<li className={styles.listItem} key={index}>
						{formatText(item)}
					</li>
				));
				elements.push(<ul className={styles.list}>{listItems}</ul>);
			} else if (elementType == 'ol') {
				const listItems = innerContent.split(':').map((item, index) => (
					<li className={styles.listItem} key={index}>
						{formatText(item)}
					</li>
				));
				elements.push(<ol className={styles.list}>{listItems}</ol>);
			} else if (elementType == 'img') {
				elements.push(<Image width={960} height={540} className={styles.image} src={innerContent} alt='img' />);
			} else if (elementType == 'note') {
				elements.push(
					<div className={styles.note}>
						<div className={`${styles.noteHeader} ${styles[innerContent.split(':')[0]]}`}>
							<i className={`icon-${innerContent.split(':')[0]} ${styles.noteIcon}`}></i>
							<p className={styles.noteHeading}>{formatText(innerContent.split(':')[1])}</p>
						</div>
						<p className={`${styles.noteContent}`}>{formatText(innerContent.split(':')[2])}</p>
					</div>
				);
			} else if (elementType == 'code') {
				elements.push(
					<div className={styles.codeblock}>
						<i
							className={`${styles.icon} icon-${innerContent.split(':')[0]}`}
							onClick={() => {
								navigator.clipboard.writeText(innerContent.split(':')[1]);
							}}
						></i>
						<pre className={styles.code}>
							<code>{innerContent.split(':')[1]}</code>
						</pre>
					</div>
				);
			} else if (elementType == 'table') {
				const rows = innerContent.split(';');
				const headerCells = rows[0].split(':');
				const bodyRows = rows.slice(1).map((row, rowIndex) => {
					const cells = row.split(':');

					if (cells.length < headerCells.length) {
						return null;
					}
					return (
						<tr key={rowIndex} className={styles.tr}>
							{cells.map((cell, cellIndex) => (
								<td key={cellIndex} className={styles.td}>
									{formatText(cell)}
								</td>
							))}
						</tr>
					);
				});
				elements.push(
					<table className={styles.table}>
						<thead className={styles.thead}>
							<tr className={styles.tr}>
								{headerCells.map((cell, index) => (
									<th key={index} className={styles.th}>
										{formatText(cell)}
									</th>
								))}
							</tr>
						</thead>
						<tbody className={styles.tbody}>{bodyRows}</tbody>
					</table>
				);
			} else if (elementType == 'quote') {
				elements.push(
					<div className={styles.quote}>
						<div className={styles.marker}></div>
						<p className={styles.quoteText}>{formatText(innerContent)}</p>
					</div>
				);
			}
		}

		return elements.length > 0 ? elements : content;
	};

	if (!document) {
		return <div className={`${styles.container} ${styles[theme]}`}></div>;
	}

	return (
		<div className={`${styles.container} ${styles[theme]}`} ref={docRef}>
			<p className={styles.path}>
				{joinedParams
					.join(' / ')
					.replace('-', ' ')
					.replace('and', '&')
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(' ')}
			</p>
			{document ? parseContent(document.content[0]) : null}
		</div>
	);
}
