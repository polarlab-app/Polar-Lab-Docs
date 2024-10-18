'use client';
import { useTheme } from '@/components/themeProvider';
import { useViewport } from '@/components/viewportProvider';
import { useState, useEffect, useRef } from 'react';
import findDoc from '@/lib/findDoc';
import styles from '@/src/css/docs/doc.module.scss';

export default function Page({ params }) {
    const { theme } = useTheme();
    const [document, setDocument] = useState(null);
    const subheadingRefs = useRef([]);
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
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    console.log(entry.target.id);
                    if (entry.isIntersecting) {
                        setCurrentView(entry.target.id);
                    }
                });
            },
            { rootMargin: '-50% 0px -50% 0px' }
        );

        subheadingRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
            subheadingRefs.current.forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [document]);

    const parseContent = (content) => {
        const regex = /&(\w+);(.*?)&\/\1;/g;
        let match;
        const elements = [];

        while ((match = regex.exec(content)) !== null) {
            const [, elementType, innerContent] = match;

            if (elementType === 'h1') {
                elements.push(<h1 className={styles.heading}>{innerContent}</h1>);
            } else if (elementType === 'h1d') {
                elements.push(<hr className={styles.headingDivider}></hr>);
            } else if (elementType === 'p') {
                elements.push(<p className={styles.text}>{innerContent}</p>);
            } else if (elementType == 'h2') {
                elements.push(
                    <h2
                        className={styles.subheading}
                        id={innerContent.toLowerCase().replace(' ', '-')}
                        ref={(el) => subheadingRefs.current.push(el)}
                    >
                        {innerContent}
                    </h2>
                );
            } else if (elementType == 'h2d') {
                elements.push(<hr className={styles.subheadingDivider}></hr>);
            } else if (elementType == 'ul') {
                const listItems = innerContent.split(':').map((item, index) => (
                    <li className={styles.listItem} key={index}>
                        {item}
                    </li>
                ));
                elements.push(<ul className={styles.list}>{listItems}</ul>);
            }
        }

        return elements.length > 0 ? elements : content;
    };

    if (!document) {
        return <div className={`${styles.container} ${styles[theme]}`}></div>;
    }

    return (
        <div className={`${styles.container} ${styles[theme]}`}>
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