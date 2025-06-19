import {useState} from "react";
import {supabase} from "../supabaseClient";

export default function Register(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')


    const {error} = await supabase.auth.signUp({
        email,
        password,
    })

    if (error){
        setError(error.message)
    } else {
        setMessage('Check your email to verify your account.')
    }
    setLoading(false)
}

return (
    <form onSubmit={handleRegister} className="max-w-sm mx-auto p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
        <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {message && <p className="text-green-600 mb-2">{message}</p>}
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
        </button>
    </form>
)
}