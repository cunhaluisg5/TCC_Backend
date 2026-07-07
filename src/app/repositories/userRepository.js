const bcrypt = require('bcryptjs');
const { getDatabase } = require('../../db/firebase');

const USERS_PATH = 'users';
const HIDDEN_FIELDS = ['password', 'passwordResetToken', 'passwordResetExpires'];

function usersRef() {
    return getDatabase().ref(USERS_PATH);
}

function withIdentifiers(id, data = {}) {
    return {
        id,
        _id: id,
        ...data
    };
}

function sanitizeUser(user, options = {}) {
    if (!user) {
        return null;
    }

    const includeSensitive = options.includeSensitive === true;
    const sanitized = { ...user };

    if (!includeSensitive) {
        for (const field of HIDDEN_FIELDS) {
            delete sanitized[field];
        }
    }

    return sanitized;
}

async function listUsers() {
    const snapshot = await usersRef().once('value');
    return snapshot.val() || {};
}

async function findByEmail(email, options = {}) {
    const users = await listUsers();
    const normalizedEmail = String(email || '').toLowerCase();

    for (const [id, user] of Object.entries(users)) {
        if (String(user.email || '').toLowerCase() === normalizedEmail) {
            return sanitizeUser(withIdentifiers(id, user), options);
        }
    }

    return null;
}

async function findByPasswordResetToken(token, options = {}) {
    const users = await listUsers();
    const normalizedToken = String(token || '').trim();

    for (const [id, user] of Object.entries(users)) {
        if (String(user.passwordResetToken || '').trim() === normalizedToken) {
            return sanitizeUser(withIdentifiers(id, user), options);
        }
    }

    return null;
}

async function findById(id, options = {}) {
    const snapshot = await usersRef().child(id).once('value');

    if (!snapshot.exists()) {
        return null;
    }

    return sanitizeUser(withIdentifiers(id, snapshot.val()), options);
}

async function createUser(data) {
    const ref = usersRef().push();
    const password = await bcrypt.hash(data.password, 10);
    const user = {
        name: data.name,
        email: String(data.email || '').toLowerCase(),
        password,
        passwordResetToken: null,
        passwordResetExpires: null,
        createdAt: new Date().toISOString()
    };

    await ref.set(user);

    return sanitizeUser(withIdentifiers(ref.key, user));
}

async function updateUser(id, updates, options = {}) {
    const currentUser = await findById(id, { includeSensitive: true });

    if (!currentUser) {
        return null;
    }

    const nextUser = {
        ...currentUser,
        ...updates
    };

    delete nextUser.id;
    delete nextUser._id;

    if (typeof updates.email === 'string') {
        nextUser.email = updates.email.toLowerCase();
    }

    if (typeof updates.password === 'string') {
        nextUser.password = await bcrypt.hash(updates.password, 10);
    }

    await usersRef().child(id).set(nextUser);

    return sanitizeUser(withIdentifiers(id, nextUser), options);
}

module.exports = {
    createUser,
    findByEmail,
    findById,
    findByPasswordResetToken,
    updateUser
};
