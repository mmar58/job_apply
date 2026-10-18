export default function LoginWidget() {
    return (
        <div className="w-full max-w-md mx-auto bg-secondary rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
            <p className="text-center text-sm text-gray-500 mb-6">Sign in to your account</p>
            <form action="">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" className="w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <button type="submit" className="w-full bg-black text-white p-2 rounded-lg">Login</button>
                </div>
            </form>
        </div>
    )
}