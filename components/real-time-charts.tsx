'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartsProps {
  projectId: string;
}

interface TimeSeriesData {
  timestamp: string;
  errors: number;
  alerts: number;
  users: number;
}

interface SeverityData {
  name: string;
  value: number;
  color: string;
}

export default function RealTimeCharts({ projectId }: ChartsProps) {
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [severityData, setSeverityData] = useState<SeverityData[]>([]);
  const [errorTrendData, setErrorTrendData] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock time series data
    const generateTimeSeriesData = () => {
      const now = new Date();
      const data: TimeSeriesData[] = [];

      for (let i = 30; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 2 * 60 * 1000); // 2-minute intervals
        data.push({
          timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          errors: Math.floor(Math.random() * 50) + 10,
          alerts: Math.floor(Math.random() * 20) + 3,
          users: Math.floor(Math.random() * 100) + 50,
        });
      }

      return data;
    };

    // Generate severity distribution
    const generateSeverityData = (): SeverityData[] => {
      return [
        { name: 'Critical', value: Math.floor(Math.random() * 10) + 2, color: '#ef4444' },
        { name: 'High', value: Math.floor(Math.random() * 20) + 5, color: '#f97316' },
        { name: 'Medium', value: Math.floor(Math.random() * 30) + 10, color: '#eab308' },
        { name: 'Low', value: Math.floor(Math.random() * 40) + 15, color: '#3b82f6' },
      ];
    };

    // Generate error trend by type
    const generateErrorTrendData = () => {
      return [
        { name: 'TypeError', errors: Math.floor(Math.random() * 50) + 20 },
        { name: 'ReferenceError', errors: Math.floor(Math.random() * 30) + 10 },
        { name: 'ValueError', errors: Math.floor(Math.random() * 25) + 8 },
        { name: 'TimeoutError', errors: Math.floor(Math.random() * 20) + 5 },
        { name: 'NetworkError', errors: Math.floor(Math.random() * 40) + 15 },
      ];
    };

    setTimeSeriesData(generateTimeSeriesData());
    setSeverityData(generateSeverityData());
    setErrorTrendData(generateErrorTrendData());

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      setTimeSeriesData(generateTimeSeriesData());
      setSeverityData(generateSeverityData());
      setErrorTrendData(generateErrorTrendData());
    }, 30000);

    return () => clearInterval(interval);
  }, [projectId]);

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      {/* Error & Alert Trends */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Error & Alert Trends (30m)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Legend />
            <Line type="monotone" dataKey="errors" stroke="#ef4444" dot={false} isAnimationActive={true} />
            <Line type="monotone" dataKey="alerts" stroke="#f97316" dot={false} isAnimationActive={true} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alert Severity Distribution */}
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Alert Severity Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Error Types Bar Chart */}
      <div className="rounded-lg border border-border bg-surface p-6 md:col-span-2">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Top Error Types</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={errorTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Bar dataKey="errors" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Users Affected Over Time */}
      <div className="rounded-lg border border-border bg-surface p-6 md:col-span-2">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Users Affected (30m)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="timestamp" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              labelStyle={{ color: '#ffffff' }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorUsers)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
