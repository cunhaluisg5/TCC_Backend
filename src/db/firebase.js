const admin = require('firebase-admin');

function normalizePrivateKey(value) {
    if (!value) {
        return undefined;
    }

    return value.replace(/\\n/g, '\n');
}

function getFirebaseConfig() {
    return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    };
}

function validateFirebaseConfig(config) {
    const missing = Object.entries(config)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(`Firebase configuration is incomplete. Missing: ${missing.join(', ')}`);
    }
}

function initializeFirebase() {
    if (admin.apps.length) {
        return admin.app();
    }

    const config = getFirebaseConfig();
    validateFirebaseConfig(config);

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey
        }),
        databaseURL: config.databaseURL
    });
}

function getDatabase() {
    return initializeFirebase().database();
}

module.exports = {
    getDatabase
};
