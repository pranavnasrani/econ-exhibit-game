import React from 'react';
import { ResultsData } from '../types';
import * as Recharts from 'recharts';

const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = Recharts;

interface HistoricalChartProps {
  data: ResultsData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 bg-gray-800/80 border border-gray-600 rounded-md shadow-lg text-sm">
                <p className="font-bold text-red-400">Year: {data.year}</p>
                <p className="text-white">Fare: S${data.fare.toFixed(2)}</p>
            </div>
        );
    }
    return null;
};

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data }) => {
    const chartData = data.map(item => ({
        year: item.year,
        fare: item.fare,
    })).sort((a, b) => a.year - b.year);

    return (
        <div className="h-full w-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wider mb-2">Fare History</h3>
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5, right: 30, left: -10, bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                            dataKey="year"
                            tick={{ fill: '#9ca3af', fontSize: 12 }} 
                        />
                        <YAxis 
                            domain={[0, 1.1]} 
                            tickFormatter={(tick) => `$${tick.toFixed(2)}`}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="fare" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 8, stroke: '#fff' }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HistoricalChart;