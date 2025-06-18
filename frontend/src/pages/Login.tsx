import {useState} from "react";
import {supabase} from "../supabaseClient";

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        const {error} = await supabase.auth.signInWithPassword({email,password})

        if (error){
            setError(error.message)
        } else{
            window.location.href = '/dashboard'
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="max-w-sm mx-auto p-4 bg-white rounded shadow">
                <h2 className="text-2xl text-black text-center font-bold mb-4">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border border-gray-300 rounded mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
           <input
               type="password"
               placeholder="Password"
               className="w-full border p-2 mb-4 border-gray-300 rounded"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               required
               />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Logging in...': 'Login'}
                </button>
    </form>
    </div>
    );
}