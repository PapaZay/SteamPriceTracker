import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function DonationSuccess() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />

                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Thank You!
                </h1>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your donation has been processed successfully. We truly appreciate your support
                    in helping us keep SteamPriceTracker running and improving!
                </p>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        📧 A receipt has been sent to your email address
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="w-full inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
                    >
                        Go to Dashboard
                    </Link>

                    <Link
                        to="/"
                        className="w-full inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200
   font-medium py-3 px-4 rounded-md transition-colors"
                    >
                        Return Home
                    </Link>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                      Questions? Contact us at support@steampricetracker.com
                  </p>
              </div>
          </div>
      );
  }

