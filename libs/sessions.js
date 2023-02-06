var sessions = {};

function getSession(n) {
	return sessions[n] || false;
}

function storeSession(n, s) {
	sessions[n] = s;
	sessions[n].bucketName = n;
}

function destroySession(n) {
	delete sessions[n];
}

export { getSession, storeSession, destroySession };
