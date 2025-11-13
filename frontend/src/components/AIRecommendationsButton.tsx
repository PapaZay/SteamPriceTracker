import {Link} from "react-router-dom";

export default function AIRecommendationsButton(){

return (
    <div className="mx-auto max-w-4xl mb-8 px-4">
                <Link to="/search">
                    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl
  hover:shadow-purple-500/50 transition-all duration-300 cursor-pointer group">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform
  duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <span className="px-3 py-1 text-xs font-bold text-purple-600 bg-white rounded-lg animate-pulse">
                                    NEW
                                </span>
                                <h2 className="text-2xl font-bold text-white">AI-Powered Game Recommendations</h2>
                            </div>
                            <p className="text-white/90 text-center">
                                Get Personalized Steam game suggestions powered by GPT-4.1-nano.
                            </p>
                            <p className="text-white/90 text-center">
                                Use either your tracked games or a custom request. (Account required)
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