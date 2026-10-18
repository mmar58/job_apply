function regenerate(req: Express.Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.regenerate((err: Error) => {
            if (err) reject(err);
            else resolve();
        })
    })
}
function saveSession(req: Express.Request): Promise<void> {
    return new Promise((resolve, reject) => {
        req.session.save(err => {
            if (err) reject(err);
            else resolve();
        })
    })
}
export async function startSession(req: Express.Request, userId: number): Promise<void> {
    await regenerate(req); // prevents session fixation
    req.session.userId = userId;
    await saveSession(req);
}