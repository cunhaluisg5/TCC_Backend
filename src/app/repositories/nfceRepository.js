const { getDatabase } = require('../../db/firebase');
const userRepository = require('./userRepository');

const NFCES_PATH = 'nfces';
const ITEMS_PATH = 'items';

function nfcesRef() {
    return getDatabase().ref(NFCES_PATH);
}

function itemsRef() {
    return getDatabase().ref(ITEMS_PATH);
}

function withIdentifiers(id, data = {}) {
    return {
        id,
        _id: id,
        ...data
    };
}

async function listCollection(ref) {
    const snapshot = await ref.once('value');
    return snapshot.val() || {};
}

async function hydrateItems(itemIds = []) {
    const items = await listCollection(itemsRef());

    return itemIds
        .map((itemId) => {
            const item = items[itemId];

            if (!item) {
                return null;
            }

            return withIdentifiers(itemId, item);
        })
        .filter(Boolean);
}

async function hydrateNfce(id, data) {
    if (!data) {
        return null;
    }

    const [user, items] = await Promise.all([
        userRepository.findById(data.user),
        hydrateItems(data.items || [])
    ]);

    return {
        ...withIdentifiers(id, data),
        user,
        items
    };
}

async function listNfces() {
    const nfces = await listCollection(nfcesRef());
    return Promise.all(
        Object.entries(nfces).map(([id, nfce]) => hydrateNfce(id, nfce))
    );
}

async function listNfcesByUser(userId) {
    const nfces = await listNfces();
    return nfces.filter((nfce) => nfce.user && nfce.user.id === userId);
}

async function findNfceById(id) {
    const snapshot = await nfcesRef().child(id).once('value');

    if (!snapshot.exists()) {
        return null;
    }

    return hydrateNfce(id, snapshot.val());
}

async function findNfceByAccessKeyForUser(accesskey, userId) {
    const nfces = await listCollection(nfcesRef());

    for (const [id, nfce] of Object.entries(nfces)) {
        if (nfce.accesskey === accesskey && nfce.user === userId) {
            return withIdentifiers(id, nfce);
        }
    }

    return null;
}

async function saveItems(nfceId, userId, items = []) {
    const itemIds = [];

    for (const item of items) {
        const ref = itemsRef().push();
        const payload = {
            nfce: nfceId,
            assignedTo: item.assignedTo || userId,
            createdAt: item.createdAt || new Date().toISOString(),
            itemName: item.itemName || '',
            itemCode: item.itemCode || '',
            qtdItem: item.qtdItem ?? null,
            unItem: item.unItem || '',
            itemValue: item.itemValue ?? null
        };

        await ref.set(payload);
        itemIds.push(ref.key);
    }

    return itemIds;
}

async function deleteItemsByNfceId(nfceId) {
    const items = await listCollection(itemsRef());
    const deletions = [];

    for (const [id, item] of Object.entries(items)) {
        if (item.nfce === nfceId) {
            deletions.push(itemsRef().child(id).remove());
        }
    }

    await Promise.all(deletions);
}

async function createNfce({ userId, items = [], details = {}, detailsNfce = {} }) {
    const ref = nfcesRef().push();
    const nfceId = ref.key;
    const itemIds = await saveItems(nfceId, userId, items);
    const payload = {
        user: userId,
        items: itemIds,
        createdAt: new Date().toISOString(),
        ...details,
        ...detailsNfce
    };

    await ref.set(payload);

    return findNfceById(nfceId);
}

async function updateNfce(nfceId, { items = [], details = {}, detailsNfce = {} }) {
    const current = await findNfceById(nfceId);

    if (!current) {
        return null;
    }

    await deleteItemsByNfceId(nfceId);
    const itemIds = await saveItems(nfceId, current.user.id, items);
    const payload = {
        ...current,
        ...details,
        ...detailsNfce,
        user: current.user.id,
        items: itemIds
    };

    delete payload.id;
    delete payload._id;

    await nfcesRef().child(nfceId).set(payload);

    return findNfceById(nfceId);
}

async function deleteNfce(nfceId) {
    await deleteItemsByNfceId(nfceId);
    await nfcesRef().child(nfceId).remove();
}

module.exports = {
    createNfce,
    deleteNfce,
    findNfceByAccessKeyForUser,
    findNfceById,
    listNfces,
    listNfcesByUser,
    updateNfce
};
