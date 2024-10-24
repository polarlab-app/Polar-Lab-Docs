import styles from '@/src/css/docs/switcher.module.scss';
import { useTheme } from './themeProvider';
import { useEffect, useState } from 'react';
import findPageDocs from '@/lib/findPageDocs';
import { useRouter } from 'next/navigation';

export default function Switcher({ params }) {
    const { theme } = useTheme();
    const router = useRouter();
    const [docs, setDocs] = useState({ next: null, prev: null });

    useEffect(() => {
        const fetchDocs = async () => {
            const data = await findPageDocs({ path: params });
            setDocs(JSON.parse(data));
            console.log(JSON.parse(data));
        };
        fetchDocs();
    }, [params]);

    return (
        <div className={`${styles.container} ${styles[theme]}`}>
            <div className={styles.button} onClick={() => router.push('/' + docs.prev.path)}>
                <i className={`${styles.icon} icon-angle-up`}></i>
                <div className={styles.textContainer}>
                    <p className={styles.text}>Commands</p>
                    <p className={styles.text}>Last Page</p>
                </div>
            </div>
            <div className={styles.button} onClick={() => router.push('/' + docs.next.path)}>
                <div className={styles.textContainer}>
                    <p className={styles.text}>Commands</p>
                    <p className={styles.text}>Next Page</p>
                </div>
                <i className={`${styles.icon} icon-angle-up`}></i>
            </div>
        </div>
    );
}
