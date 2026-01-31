"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Ticket,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart2,
  PieChart
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, ComposedChart, Line, Legend
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const metrics = [
  {
    label: "Total Tickets",
    value: "1,247",
    change: "+12%",
    trend: "up",
    icon: Ticket,
  },
  {
    label: "Active Reps",
    value: "24",
    change: "+2",
    trend: "up",
    icon: Users,
  },
  {
    label: "Resolution Rate",
    value: "94.2%",
    change: "+3.1%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Avg Response",
    value: "4.2m",
    change: "-1.3m",
    trend: "down",
    icon: Clock,
  },
];

// --- Stock-like data sets ---

const dataSets: Record<string, any[]> = {
    'happiness': [
        { time: '09:00', value: 4.2 }, { time: '10:00', value: 4.3 },
        { time: '11:00', value: 4.1 }, { time: '12:00', value: 3.9 },
        { time: '13:00', value: 4.0 }, { time: '14:00', value: 4.4 },
        { time: '15:00', value: 4.6 }, { time: '16:00', value: 4.7 },
    ],
    'volume': [
        { time: '09:00', value: 120 }, { time: '10:00', value: 145 },
        { time: '11:00', value: 110 }, { time: '12:00', value: 85 },
        { time: '13:00', value: 95 }, { time: '14:00', value: 130 },
        { time: '15:00', value: 155 }, { time: '16:00', value: 140 },
    ],
    'wait_time': [
        { time: '09:00', value: 3.5 }, { time: '10:00', value: 4.2 },
        { time: '11:00', value: 2.8 }, { time: '12:00', value: 1.5 },
        { time: '13:00', value: 2.0 }, { time: '14:00', value: 5.1 },
        { time: '15:00', value: 4.8 }, { time: '16:00', value: 3.2 },
    ],
    'combined': [
        { time: '09:00', happiness: 4.2, stock: 142.50, volume: 120 },
        { time: '10:00', happiness: 4.3, stock: 143.20, volume: 145 },
        { time: '11:00', happiness: 4.1, stock: 141.80, volume: 110 }, // Stock follows happiness dip
        { time: '12:00', happiness: 3.9, stock: 139.50, volume: 85 },
        { time: '13:00', happiness: 4.0, stock: 140.10, volume: 95 },
        { time: '14:00', happiness: 4.4, stock: 144.00, volume: 130 },
        { time: '15:00', happiness: 4.6, stock: 146.50, volume: 155 },
        { time: '16:00', happiness: 4.7, stock: 148.20, volume: 140 },
    ]
};

const liveTickerItems = [
    { symbol: "TKT-VOL", value: "1,247", change: "+4.5%", up: true },
    { symbol: "CSAT", value: "4.62", change: "+0.12", up: true },
    { symbol: "WAIT-TM", value: "1m 42s", change: "-12s", up: true },
    { symbol: "ESC-RT", value: "5.2%", change: "+0.8%", up: false },
];

export default function AdminDashboard() {
  const [chartView, setChartView] = useState("happiness");
  const [timeRange, setTimeRange] = useState("today");

  // Earthy & Subtle Color Palette
  const colors = {
    primary: "#6f8551", // Sage (Happiness)
    stock: "#3f3f46",   // Charcoal (Stock Price)
    volume: "#64748b",  // Slate (Volume)
    wait: "#a16207",    // Ochre (Wait Time)
    success: "#6f8551",
    error: "#9f1239",   // Maroonish Red
    grid: "#e5e7eb",
  };

  const getChartConfig = (view: string) => {
      switch(view) {
          case 'happiness': return { color: colors.primary, label: "Customer Happiness Index (CHI)", icon: Activity, domain: [2, 5] };
          case 'volume': return { color: colors.volume, label: "Ticket Volume vs Time", icon: BarChart2, domain: [0, 'auto'] };
          case 'wait_time': return { color: colors.wait, label: "Avg Wait Time (min)", icon: Clock, domain: [0, 10] };
          case 'combined': return { color: colors.stock, label: "Market Correlation: Sentiment vs Price", icon: TrendingUp, domain: [0, 'auto'] };
          default: return { color: colors.primary, label: "Metric", icon: Activity, domain: [0, 'auto'] };
      }
  };

  const config = getChartConfig(chartView);
  const ChartIcon = config.icon;

  // Mock Data Generator based on range
  const getData = (range: string) => {
    const base = [
       { time: '09:00', happiness: 4.2, stock: 142.50, volume: 120, wait_time: 2.1 },
       { time: '10:00', happiness: 4.3, stock: 143.20, volume: 145, wait_time: 3.5 },
       { time: '11:00', happiness: 4.1, stock: 141.80, volume: 110, wait_time: 4.2 }, 
       { time: '12:00', happiness: 3.9, stock: 139.50, volume: 85,  wait_time: 1.5 },
       { time: '13:00', happiness: 4.0, stock: 140.10, volume: 95,  wait_time: 2.0 },
       { time: '14:00', happiness: 4.4, stock: 144.00, volume: 130, wait_time: 5.1 },
       { time: '15:00', happiness: 4.6, stock: 146.50, volume: 155, wait_time: 4.8 },
       { time: '16:00', happiness: 4.7, stock: 148.20, volume: 140, wait_time: 3.2 },
    ];

    if (range === '7d') {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
            time: day,
            happiness: 4.0 + (i * 0.1) + (Math.random() * 0.4 - 0.2),
            stock: 140 + (i * 2) + (Math.random() * 5 - 2.5),
            volume: 800 + (Math.random() * 400),
            wait_time: 3 + (Math.random() * 1.5)
        }));
    }
    if (range === '30d') {
        return Array.from({length: 10}, (_, i) => ({
            time: `Week ${Math.floor(i/2) + 1}`, // Simplified x-axis
            happiness: 3.8 + (i * 0.05),
            stock: 130 + (i * 3),
            volume: 5000 + (Math.random() * 1000),
            wait_time: 4 + (Math.random())
        }));
    }
    return base;
  };

  const chartData = getData(timeRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-semibold text-[#2D3E2F]">Command Center</h1>
           <p className="text-muted-foreground">Live operational oversight</p>
        </div>
        <div className="flex items-center gap-4">
             <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px] h-9 text-sm bg-white/50 border-input/60">
                    <SelectValue placeholder="Range" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm font-mono bg-muted/40 px-3 py-1 rounded-full border border-border/50">
                <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Operational
            </div>
        </div>
      </div>

      {/* --- LIVE TICKER --- */}
      <div className="w-full bg-[#2D3E2F] text-white rounded-lg overflow-hidden py-2 px-4 flex items-center gap-8 shadow-md">
        <span className="text-xs font-bold text-white/50 tracking-wider">LIVE MARGINS</span>
        <div className="flex flex-1 items-center justify-around">
            {liveTickerItems.map((item) => (
                <div key={item.symbol} className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-white/70">{item.symbol}</span>
                    <span className="font-bold">{item.value}</span>
                    <span className={`text-xs flex items-center ${item.up ? 'text-green-400' : 'text-red-400'}`}>
                        {item.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {item.change}
                    </span>
                </div>
            ))}
        </div>
      </div>

      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: MAIN CHART (Takes 2/3 width) */}
          <div className="lg:col-span-2">
            <Card className="h-full border-t-4 shadow-sm" style={{ borderTopColor: config.color }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2 text-[#2D3E2F]">
                                <ChartIcon className="h-5 w-5" style={{ color: config.color }} />
                                {config.label}
                            </CardTitle>
                            <CardDescription>Real-time data aggregation</CardDescription>
                        </div>
                        <Select value={chartView} onValueChange={setChartView}>
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/20 border-border/50">
                                <SelectValue placeholder="Select Metric" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="happiness">Happiness Index</SelectItem>
                                <SelectItem value="volume">Ticket Volume</SelectItem>
                                <SelectItem value="wait_time">Wait Times</SelectItem>
                                <SelectItem value="combined">Combined Overview</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                             {chartView === 'combined' ? (
                                <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                                    <YAxis yAxisId="left" domain={[2, 5.5]} hide />
                                    <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} hide />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend />
                                    <Area 
                                        yAxisId="left"
                                        type="monotone" 
                                        dataKey="happiness" 
                                        name="Sentiment"
                                        stroke={colors.primary} 
                                        fill={colors.primary} 
                                        fillOpacity={0.15}
                                        strokeWidth={2}
                                    />
                                    <Line 
                                        yAxisId="right"
                                        type="monotone" 
                                        dataKey="stock" 
                                        name="Stock Price"
                                        stroke={colors.stock} 
                                        strokeWidth={2.5}
                                        dot={{ r: 3, strokeWidth: 0, fill: colors.stock }}
                                        activeDot={{ r: 5, strokeWidth: 0, fill: colors.stock }}
                                    />
                                </ComposedChart>
                             ) : (
                                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`color-${chartView}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={config.color} stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6B7280'}} />
                                    <YAxis domain={config.domain as any} hide />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ stroke: config.color, strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey={chartView}
                                        stroke={config.color} 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill={`url(#color-${chartView})`} 
                                        activeDot={{ r: 6, strokeWidth: 0, fill: config.color }}
                                    />
                                </AreaChart>
                             )}
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* RIGHT: METRICS GRID (Takes 1/3 width, stacked 2x2) */}
          <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <Card key={metric.label} className="flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow border-muted/40">
                    <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="rounded-md bg-muted/40 p-2">
                            <metric.icon
                                className="h-4 w-4 text-muted-foreground"
                                strokeWidth={2}
                            />
                        </div>
                        <div
                            className={`flex items-center gap-0.5 text-xs font-medium ${
                                metric.trend === "up" ? "text-[#6f8551]" : "text-[#9f1239]"
                            }`}
                        >
                            {metric.trend === "up" ? (
                                <ArrowUpRight className="h-3 w-3" />
                            ) : (
                                <ArrowDownRight className="h-3 w-3" />
                            )}
                            {metric.change}
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-[#2D3E2F]">{metric.value}</div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">{metric.label}</p>
                    </div>
                    </CardContent>
                </Card>
              ))}
          </div>
      </div>

      {/* content grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* recent activity */}
        <Card className="col-span-2">
          <CardContent className="p-4">
            <h3 className="mb-4 font-medium">Recent Activity</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      Ticket #TKT-{1000 + i} resolved
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by Sarah Johnson • Acme Corp
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {i * 5}m ago
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* quick stats */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-medium">Support Levels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">L1 Support</span>
                <span className="font-medium">18</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-3/4 rounded-full bg-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">L2 Support</span>
                <span className="font-medium">5</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-1/4 rounded-full bg-sage-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">L3 Support</span>
                <span className="font-medium">1</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-full w-[8%] rounded-full bg-sand" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
