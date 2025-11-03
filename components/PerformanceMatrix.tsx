import React from 'react';
import { ResultsData } from '../types';
import * as Recharts from 'recharts';

const { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

interface PerformanceMatrixProps {
  data: ResultsData[];
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="p-2 bg-gray-800/80 border border-gray-600 rounded-md shadow-lg text-sm">
                <p className="font-bold text-red-400">Year: {data.year}</p>
                <p className="text-white">Satisfaction: {data.satisfaction.toFixed(1)}%</p>
                <p className="text-white">Profit: ${(data.profit / 1000).toFixed(0)}k</p>
            </div>
        );
    }
    return null;
};

const PerformanceMatrix: React.FC<PerformanceMatrixProps> = ({ data }) => {
    const chartData = data.map(item => ({
        ...item,
        x: item.satisfaction,
        y: item.profit,
    }));
    
    const minProfit = Math.min(...chartData.map(d => d.profit), -100000);
    const maxProfit = Math.max(...chartData.map(d => d.profit), 200000);

    return (
        <div className="h-full w-full flex flex-col items-center">
            <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wider mb-2">Performance Matrix</h3>
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                            type="number" 
                            dataKey="x" 
                            name="Satisfaction" 
                            unit="%" 
                            domain={[0, 100]}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            label={{ value: 'Public Satisfaction →', position: 'insideBottom', offset: -10, fill: '#d1d5db' }}
                        />
                        <YAxis 
                            type="number" 
                            dataKey="y" 
                            name="Profit" 
                            unit="k"
                            domain={[minProfit, maxProfit]}
                            tickFormatter={(tick) => `${(tick / 1000)}k`}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            label={{ value: 'Profit →', angle: -90, position: 'insideLeft', offset: -10, fill: '#d1d5db' }}
                        />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                        <Scatter name="Yearly Performance" data={chartData} fill="#f87171" shape="circle" />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceMatrix;
