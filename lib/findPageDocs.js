'use server';
import doc from '@/src/schemas/doc';

export default async function findPageDocs({ path }) {
    const nextDoc = await doc.findOne({ path: { $gt: path.join('/') } }).sort({ path: 1 });
    const prevDoc = await doc.findOne({ path: { $lt: path.join('/') } }).sort({ path: -1 });

    if (!nextDoc && !prevDoc) {
        return 'none';
    }

    return JSON.stringify({ next: nextDoc, prev: prevDoc });
}
