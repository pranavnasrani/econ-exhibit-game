import React from 'react';
import { ResultsData } from '../types';
import * as Recharts from 'recharts';

const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList, Legend, GroupedBar } = Recharts;

interface DashboardProps {
  data: Omit<ResultsData, 'year' | 'fare' | 'outcomeMessage'>;
}

const formatRidership = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;
const formatCurrency = (value: number) => `$${(value / 1_000).toFixed(0)}k`;
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
        <div className="h-full w-full flex flex-col items-center p-2 sm:p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wider mb-2">{name}</h3>
            <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                        <XAxis type="number" hide domain={[0, maxValue]} />
                        <YAxis type="category" dataKey="name" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.1)'}}/>
                        <Bar dataKey="value" barSize={32} radius={[6, 6, 6, 6]}>
                            <LabelList dataKey="value" position="insideRight" formatter={formatter} className="fill-white font-bold text-md" />
                             <Cell fill={color}/>
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-2xl font-bold mt-1" style={{color}}>{formatter(value)}</p>
        </div>
    );
};

const ProfitChart: React.FC<{ revenue: number; costs: number; profit: number }> = ({ revenue, costs, profit }) => {
    const chartData = [{ name: 'Financials', revenue, costs }];
    
    return (
        <div className="h-full w-full flex flex-col items-center p-2 sm:p-4 bg-gray-900/50 border border-gray-700/50 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-gray-300 uppercase tracking-wider mb-2">Financials</h3>
            <div className="w-full h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide domain={[0, 'dataMax + 100000']}/>
                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} cursor={{fill: 'rgba(255,255,255,0.1)'}}/>
                        <Legend wrapperStyle={{fontSize: '12px', bottom: -5}}/>
                        <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={40}>
                             <LabelList dataKey="revenue" position="top" formatter={formatCurrency} className="fill-gray-300 font-bold text-xs" />
                        </Bar>
                         <Bar dataKey="costs" name="Costs" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40}>
                             <LabelList dataKey="costs" position="top" formatter={formatCurrency} className="fill-gray-300 font-bold text-xs" />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <p className={`text-2xl font-bold mt-1 ${profit < 0 ? 'text-red-400' : 'text-green-400'}`}>
                Profit: {formatCurrency(profit)}
            </p>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="h-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricChart name="Ridership" value={data.ridership} maxValue={1300000} formatter={formatRidership} color="#3b82f6" />
        <ProfitChart revenue={data.totalRevenue} costs={data.costs} profit={data.profit} />
        <MetricChart name="Satisfaction" value={data.satisfaction} maxValue={100} formatter={formatSatisfaction} color={getBarColor(data.satisfaction)} />
    </div>
  );
};

export default Dashboard;
