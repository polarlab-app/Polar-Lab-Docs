import doc from '@/src/schemas/doc';

export default function findPageDocs({path}) {
    const nextDoc = doc.findOne({ path: { $gt: path } });
    const prevDoc = doc.findOne({ path: { $lt: path } });

    if (!nextDoc && !prevDoc) {
        return 'none';
    }

    return JSON.stringify({ nextDoc, prevDoc });
}