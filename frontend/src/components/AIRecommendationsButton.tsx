import {Link} from "react-router-dom";

export default function AIRecommendationsButton(){

return (
    <div className="mx-auto max-w-4xl mb-8 px-4">
                <Link to="/search">
                    <div className="relative overflow-hidden bg-blue-700 rounded-2xl p-6 shadow-2xl
   transition-all duration-300 cursor-pointer group">

                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-white">AI-Powered Game Recommendations</h2>
                            </div>
                            <p className="text-white/90 text-center">
                                Personalized Steam game suggestions powered by GPT-4.1-nano.
                            </p>
                            <p className="text-white/90 text-center">
                                Get Recommendations from a custom request or from your tracked games. (Account required)
                            </p>
                            <p className="text-white/90 text-center">
                                Try it now!
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
);
}