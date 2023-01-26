db.createUser(
    {
        user: "test-user",
        pwd: "test-pass",
        roles: [
            {
                role: "readWrite",
                db: "bitcore"
            }
        ]
    }
);
