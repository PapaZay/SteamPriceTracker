import Plot from 'react-plotly.js'

interface PriceData {
    timestamp: string;
    final_price: number;
    initial_price: number;
    discount_percent: number;
    currency: string;
}

interface PriceChartProps {
    data: PriceData[];
    gameName: string;
    height?: number;
    showTitle?: boolean;
}

export const PriceChart = ({
    data,
    gameName,
    height = 300,
    showTitle = true
}: PriceChartProps) => {
    const sortedData = [...data].sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const x = sortedData.map(item => item.timestamp);
    const y = sortedData.map(item => item.final_price);
    const currency = sortedData[0]?.currency || 'USD';

    return (
        <Plot
            data={[{
                x: x,
                y: y,
                type: 'scatter',
                mode: 'lines+markers',
                line: {
                    color: '#1f77b4',
                    width: 2
                },
                marker: {
                    size: 4,
                    color: '#1f77b4'
                },
                name: 'Price',
                hovertemplate: `<b>%{y} ${currency}</b><br>%{x}<extra></extra>`
            }]}
            layout={{
                height: height,
                margin: { t: showTitle ? 40 : 10, r: 10, b: 40, l: 50 },
                title: showTitle ? `${gameName} - Price History` : '',
                xaxis: {
                    title: 'Date',
                    type: 'date'
                },
                yaxis: {
                    title: `Price (${currency})`,
                    fixedrange: false
                },
                showlegend: false,
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)'
            }}
            config={{
                displayModeBar: false,
                responsive: true
            }}
            style={{ width: '100%', height: '100%' }}
            />
    );
};