import React from 'react';
import { ResultsData } from '../types';
import * as Recharts from 'recharts';

const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } = Recharts;

interface DashboardProps {
  data: ResultsData;
}

const formatRidership = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;
const formatProfit = (value: number) => `$${(value / 1_000).toFixed(0)}k`;
const formatSatisfaction = (value: number) => `${value.toFixed(0)}%`;

const getBarColor = (value: number) => {
    if (value < 40) return "#ef4444"; // red
    if (value < 75) return "#f59e0b"; // amber
    return "#22c55e"; // green
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-gray-800/80 border border-gray-600 rounded-md shadow-lg">
                <p className="text-white">{`${label}: ${payload[0].value.toLocaleString()}`}</p>
            </div>
        );
    }
    return null;
};

const MetricChart: React.FC<{ name: string; value: number; maxValue: number; formatter: (val: number) => string; color: string }> = ({ name, value, maxValue, formatter, color }) => {
    const chartData = [{ name, value }];

    return (
        <div className="h-full w-full flex flex-col items-center p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-300 uppercase tracking-wider mb-4">{name}</h3>
            <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <XAxis type="number" hide domain={[0, maxValue]} />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.1)'}}/>
                        <Bar dataKey="value" barSize={40} radius={[8, 8, 8, 8]}>
                            <LabelList dataKey="value" position="insideRight" formatter={formatter} className="fill-white font-bold text-lg" />
                             <Cell fill={color}/>
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-3xl font-bold mt-2" style={{color}}>{formatter(value)}</p>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="h-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricChart name="Ridership" value={data.ridership} maxValue={1200000} formatter={formatRidership} color="#3b82f6" />
        <MetricChart name="Profit" value={data.profit} maxValue={600000} formatter={formatProfit} color={data.profit < 0 ? '#ef4444' : '#22c55e'} />
        <MetricChart name="Satisfaction" value={data.satisfaction} maxValue={100} formatter={formatSatisfaction} color={getBarColor(data.satisfaction)} />
    </div>
  );
};

export default Dashboard;