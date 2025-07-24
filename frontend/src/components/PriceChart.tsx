import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

  interface PriceData {
    timestamp: string;
    final_price: number;
    initial_price: number;
    discount_percent: number;
    currency: string;
  }

  interface PriceChartProps {
    data: PriceData[];
    height?: number;
    showTitle?: boolean;
  }

  export const PriceChart = ({
    data,
    height = 300,
    showTitle = true
  }: PriceChartProps) => {
    // Sort and format data for Recharts
    const chartData = data
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString(),
        price: item.final_price,
        fullDate: item.timestamp
      }));

    const currency = data[0]?.currency || 'USD';

    return (
      <div style={{ width: '100%', height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              fontSize={12}
            />
            <YAxis
              fontSize={12}
              label={{ value: `Price (${currency})`, angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              formatter={(value) => [`${value} ${currency}`, 'Price']}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{
                background: '#374151',
                color: 'white',
                  border: '1px solid #6B7280',
                borderRadius: '6px',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#1f77b4"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };
