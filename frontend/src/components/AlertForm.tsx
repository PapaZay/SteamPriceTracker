import { useState } from "react";
import {ChevronDownIcon, ChevronUpIcon} from "lucide-react";

interface AlertFormProps {
    game: {
        app_id: number;
        name: string;
    };
    onCreateAlert: (alertData: any) => void;
}
const AlertForm = ({game, onCreateAlert}: AlertFormProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [alertData, setAlertData] = useState({
     //   target_price: '',
        discount_percent: '',
        price_drop: false
    });

    const handleSubmit = (alertType: string, value: number) => {
        onCreateAlert({app_id: game.app_id, alert_type: alertType, target_value: value});
    };

    return (
    <div className="mt-3 mb-3">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Set Alert
            {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
            <div className="mt-3 space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {/*<div className="flex items-center gap-3">*/}
                {/*    <span className="text-2xl">💰</span>*/}
                {/*    <div className="flex-1">*/}
                {/*        <div className="flex items-center gap-2">*/}
                {/*            <input*/}
                {/*                type="number"*/}
                {/*                placeholder="15.99"*/}
                {/*                className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"*/}
                {/*                value={alertData.target_price}*/}
                {/*                onChange={(e) => setAlertData({...alertData, target_price: e.target.value})}*/}
                {/*            />*/}
                {/*            <span className="text-sm text-gray-600">Alert when below this price</span>*/}
                {/*            <button*/}
                {/*                onClick={() => handleSubmit('target_price', parseFloat(alertData.target_price))}*/}
                {/*                className="px-3 py-1 bg-green-600 text-white rounded text-sm"*/}
                {/*                disabled={!alertData.target_price}*/}
                {/*            >*/}
                {/*                Set*/}
                {/*            </button>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                placeholder="50"
                                className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={alertData.discount_percent}
                                onChange={(e) => setAlertData({...alertData, discount_percent: e.target.value})}
                            />
                            <span className="text-sm text-gray-600">% Alert when discount reaches</span>
                            <button
                                onClick={() => handleSubmit('percentage_discount', parseFloat(alertData.discount_percent))}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                disabled={!alertData.discount_percent}
                                >
                                Set
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-2xl">📉</span>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={alertData.price_drop}
                                    onChange={(e) => setAlertData({...alertData, price_drop: e.target.checked})}
                                />
                                <span className="text-sm text-gray-600">Alert on any price decrease</span>
                            </label>
                            <button
                                onClick={() => handleSubmit('price_drop', 0)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                                disabled={!alertData.price_drop}
                                >
                                Set
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
};
export default AlertForm;