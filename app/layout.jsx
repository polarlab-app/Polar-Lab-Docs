import '@/src/css/global/global.scss';
import '@/src/css/global/icons.css';
import { ThemeProvider } from '@/components/themeProvider';
import { CSPostHogProvider } from './providers';

export default async function RootLayout({ children }) {
    return (
        <html lang='en'>
            <CSPostHogProvider>
                <body className='body' id='body'>
                    <ThemeProvider>{children}</ThemeProvider>
                </body>
            </CSPostHogProvider>
        </html>
    );
}
