"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, AlertTriangle, AlertCircle, RefreshCcw, HelpCircle, BrainCircuit, HeartHandshake } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

// --- Earthy & Subtle Color Palette ---
const colors = {
    sage: "#6f8551",
    sageLight: "#ecfccb", 
    maroon: "#9f1239",
    maroonLight: "#ffe4e6",
    ochre: "#b45309",
    ochreLight: "#fef3c7",
    slate: "#64748b",
    slateLight: "#f1f5f9",
    charcoal: "#3f3f46",
    darkGreen: "#2D3E2F",
    grid: "#e5e7eb"
};

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");

  // --- Dynamic Data Generators ---

  const getMetrics = (range: string) => {
      const multipliers: Record<string, number> = { "7d": 0.25, "30d": 1, "90d": 3, "year": 12 };
      const m = multipliers[range] || 1;
      
      return [
        { label: "Total Tickets", value: Math.floor(12847 * m).toLocaleString(), change: range === '7d' ? "-2%" : "+8%", trend: range === '7d' ? "down" : "up" },
        { label: "Resolution Rate", value: range === '7d' ? "91.5%" : (range === '90d' ? "96.2%" : "94.2%"), change: range === '7d' ? "-1.2%" : "+2.1%", trend: range === '7d' ? "down" : "up" },
        { label: "Avg Handle Time", value: range === 'year' ? "18.2m" : (range === '7d' ? "12.1m" : "14.5m"), change: range === 'year' ? "+1.2m" : "-2.3m", trend: range === 'year' ? "down" : "up" }, 
        { label: "CSAT Score", value: range === '7d' ? "3.9" : (range === '90d' ? "4.8" : "4.6"), change: range === '7d' ? "-0.4" : "+0.3", trend: range === '7d' ? "down" : "up" },
      ];
  };

  const getEscalationReasons = (range: string) => {
      if (range === '7d') return [
          { name: 'Server Outage', value: 60, color: colors.maroon }, 
          { name: 'Login Bugs', value: 20, color: colors.ochre }, 
          { name: 'Payment Fail', value: 10, color: colors.slate },
          { name: 'Other', value: 10, color: colors.sage }, 
      ];
      if (range === '90d') return [
           { name: 'Feature Gaps', value: 40, color: colors.maroon }, 
           { name: 'Integration', value: 30, color: colors.ochre }, 
           { name: 'Billing', value: 20, color: colors.slate }, 
           { name: 'User Error', value: 10, color: colors.sage }, 
      ];
      return [
          { name: 'Technical Complexity', value: 45, color: colors.maroon }, 
          { name: 'Lack of Permissions', value: 25, color: colors.ochre }, 
          { name: 'Customer Request', value: 20, color: colors.slate }, 
          { name: 'Language Barrier', value: 10, color: colors.sage }, 
      ];
  };

  const getConfusionPoints = (range: string) => {
      if (range === '7d') return [
          { name: '2FA Setup', score: 88, color: colors.maroon },
          { name: 'Password Reset', score: 72, color: colors.ochre },
          { name: 'Mobile Login', score: 45, color: colors.slate },
          { name: 'App Update', score: 30, color: colors.sage },
      ];
       if (range === '90d') return [
          { name: 'API Rate Limits', score: 95, color: colors.maroon },
          { name: 'Webhook Config', score: 80, color: colors.ochre },
          { name: 'Oauth Scopes', score: 60, color: colors.slate },
          { name: 'SDK Usage', score: 45, color: colors.sage },
      ];
      if (range === 'year') return [
          { name: 'Legacy Migration', score: 92, color: colors.maroon },
          { name: 'Enterprise Contract', score: 78, color: colors.ochre },
          { name: 'SLA Terms', score: 50, color: colors.slate },
          { name: 'Compliance', score: 45, color: colors.sage },
      ];
      return [
          { name: 'Billing Cycle', score: 85, color: colors.maroon },
          { name: 'Feature Activation', score: 65, color: colors.ochre },
          { name: 'Account Settings', score: 45, color: colors.slate },
          { name: 'API Integration', score: 30, color: colors.sage },
      ];
  };

  const getRecurringIssues = (range: string) => {
      const mult = range === '7d' ? 1 : (range === '90d' ? 10 : 4);
      return [
          { name: 'Login Failures', count: Math.floor(30 * mult) },
          { name: 'Payment Processing', count: Math.floor(24 * mult) },
          { name: 'Sync Errors', count: Math.floor(21 * mult) },
          { name: 'Mobile App Crash', count: Math.floor(13 * mult) },
      ];
  };

  const getAgentStruggles = (range: string) => {
      if (range === '7d') return [
        { subject: 'Speed', A: 40, fullMark: 150 }, // Struggle is low score? Or High? Chart implies higher is better usually, let's assume High A = Good. So struggle means Low A.
        // Actually the previous chart was "Agent Score", so Low is bad.
        // Let's invert relative to text. If title is "Speed", Speed should be low.
        { subject: 'Product Knowledge', A: 140, fullMark: 150 },
        { subject: 'Empathy', A: 130, fullMark: 150 },
        { subject: 'Tool Proficiency', A: 120, fullMark: 150 },
        { subject: 'Speed', A: 70, fullMark: 150 }, // The struggle
        { subject: 'Protocol', A: 110, fullMark: 150 },
        { subject: 'Upselling', A: 135, fullMark: 150 },
      ];
      if (range === '90d') return [
        { subject: 'Product Knowledge', A: 130, fullMark: 150 },
        { subject: 'Empathy', A: 140, fullMark: 150 },
        { subject: 'Tool Proficiency', A: 80, fullMark: 150 }, // Struggle: Tools
        { subject: 'Speed', A: 120, fullMark: 150 },
        { subject: 'Protocol', A: 110, fullMark: 150 },
        { subject: 'Upselling', A: 115, fullMark: 150 },
      ];
      // Default Upselling struggle
      return [
        { subject: 'Product Knowledge', A: 120, fullMark: 150 },
        { subject: 'Empathy', A: 140, fullMark: 150 },
        { subject: 'Tool Proficiency', A: 110, fullMark: 150 },
        { subject: 'Speed', A: 115, fullMark: 150 },
        { subject: 'Protocol', A: 125, fullMark: 150 },
        { subject: 'Upselling', A: 65, fullMark: 150 }, // Low score
      ];
  };

  const getInsightHighlights = (range: string) => {
      if (range === '7d') return {
          sentimentTitle: "Mixed (3.9/5)",
          sentimentDesc: "Downtrend due to recent server outages on Monday.",
          struggleTitle: "Response Speed",
          struggleDesc: "Agents overwhelmed by ticket surge from outage.",
          struggleRec: "Deploy 'Crisis Management' playbook.",
          confusionTitle: "2FA Setup",
          confusionDesc: "88% of tickets relate to new SMS verification update.",
          confusionStep: "Rollback SMS provider update or pin FAQ."
      };
      if (range === '90d') return {
          sentimentTitle: "Excellent (4.8/5)",
          sentimentDesc: "Steady growth after Q3 feature releases.",
          struggleTitle: "Tool Proficiency",
          struggleDesc: "New CRM migration causing friction for senior agents.",
          struggleRec: "Schedule 'Advanced CRM' workshops.",
          confusionTitle: "API Rate Limits",
          confusionDesc: "Dev customers hitting new lower tiers unexpectedly.",
          confusionStep: "Review API tier communications."
      };
      if (range === 'year') return {
          sentimentTitle: "Stable (4.5/5)",
          sentimentDesc: "Consistent performance throughout the fiscal year.",
          struggleTitle: "Protocol Compliance",
          struggleDesc: "Skipping verification steps to rush closures.",
          struggleRec: "Audit random 5% of closed tickets.",
          confusionTitle: "Legacy Migration",
          confusionDesc: "Long-term clients struggling with V2 platform shift.",
          confusionStep: "Create dedicated Migration Support squad."
      };
      return {
          sentimentTitle: "Positive (4.6/5)",
          sentimentDesc: "Trending up as support response time improves.",
          struggleTitle: "Upselling",
          struggleDesc: "Agents hesitate to offer premium plans during conflict.",
          struggleRec: "Training module 'Value Selling' recommended.",
          confusionTitle: "Billing Cycle",
          confusionDesc: "34% of L1 tickets relate to pro-rated charges.",
          confusionStep: "FAQ Article #402 needs update."
      };
  }

  const getSentimentTrend = (range: string) => {
    if (range === "7d") {
      return [
        { label: 'Mon', sentiment: 2.2 }, { label: 'Tue', sentiment: 3.1 }, // Bad start
        { label: 'Wed', sentiment: 3.8 }, { label: 'Thu', sentiment: 4.0 },
        { label: 'Fri', sentiment: 4.2 }, { label: 'Sat', sentiment: 4.5 },
        { label: 'Sun', sentiment: 4.6 },
      ];
    } else if (range === "90d") {
      return [
        { label: 'Wk 1', sentiment: 3.8 }, { label: 'Wk 4', sentiment: 4.2 },
        { label: 'Wk 8', sentiment: 4.6 }, { label: 'Wk 12', sentiment: 4.9 },
      ];
    } else if (range === "year") {
        return [
            { label: 'Q1', sentiment: 4.1 }, { label: 'Q2', sentiment: 4.3 },
            { label: 'Q3', sentiment: 4.4 }, { label: 'Q4', sentiment: 4.5 },
        ];
    }
    return [
        { label: 'Wk 1', sentiment: 4.1 }, { label: 'Wk 2', sentiment: 4.3 },
        { label: 'Wk 3', sentiment: 4.2 }, { label: 'Wk 4', sentiment: 4.6 },
    ]; 
  };
  
  const getMissedPromises = (range: string) => {
      const startId = range === '7d' ? 9000 : 1000;
      if (range === '7d') return [
          { id: 1, promise: "Server Up in 30m", current: "3h downtime", impact: "Critical", ticket: `#INC-001` },
          { id: 2, promise: "Email reply 1h", current: "4h delay", impact: "High", ticket: `#T-9102` },
      ];
      return [
        { id: 1, promise: "Callback within 2 hours", current: "4.5 hours avg", impact: "High", ticket: `#T-${startId+1}` },
        { id: 2, promise: "Refund processed in 5 days", current: "7 days avg", impact: "Medium", ticket: `#T-${startId+23}` },
        { id: 3, promise: "Feature fix update", current: "No update sent", impact: "High", ticket: `#T-${startId+5}` },
      ];
  };

  // --- Current Data ---
  const metrics = getMetrics(timeRange);
  const escalationReasons = getEscalationReasons(timeRange);
  const confusionPoints = getConfusionPoints(timeRange);
  const recurringIssues = getRecurringIssues(timeRange);
  const struggles = getAgentStruggles(timeRange);
  const sentimentData = getSentimentTrend(timeRange);
  const missedPromises = getMissedPromises(timeRange);
  const highlights = getInsightHighlights(timeRange);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#2D3E2F]">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Deep dive into performance, customer sentiment, and operational bottlenecks.
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
           <SelectTrigger className="w-[180px] bg-white/50 border-input/60">
             <SelectValue placeholder="Select range" />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="7d">Last 7 Days</SelectItem>
             <SelectItem value="30d">Last 30 Days</SelectItem>
             <SelectItem value="90d">Last Quarter</SelectItem>
             <SelectItem value="year">Year to Date</SelectItem>
           </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="insights">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="insights">Deep Insights</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        {/* --- DEEP INSIGHTS TAB --- */}
        <TabsContent value="insights" className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-2">
          
          {/* Top Row: Key Qualitative Indicators */}
          <div className="grid md:grid-cols-3 gap-6">
             <Card className="bg-stone-50/50 border-stone-200 shadow-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium text-stone-700 flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4" /> Company Sentiment
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-3xl font-bold text-[#2D3E2F]">{highlights.sentimentTitle}</div>
                   <p className="text-xs text-muted-foreground mt-1">{highlights.sentimentDesc}</p>
                   <div className="h-[60px] w-full mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={sentimentData}>
                            <Line type="monotone" dataKey="sentiment" stroke={colors.sage} strokeWidth={2} dot={false} />
                            <Tooltip />
                         </LineChart>
                      </ResponsiveContainer>
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-amber-50/30 border-amber-100 shadow-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium text-amber-900/80 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4" /> Top Agent Struggle
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-3xl font-bold text-[#b45309]">{highlights.struggleTitle}</div>
                   <p className="text-xs text-amber-700/70 mt-1">{highlights.struggleDesc}</p>
                   <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-100/50 p-2 rounded border border-amber-100/50">
                      <AlertCircle className="h-3 w-3" /> {highlights.struggleRec}
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-red-50/30 border-red-100 shadow-sm">
                <CardHeader className="pb-2">
                   <CardTitle className="text-sm font-medium text-red-900/80 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Critical Confusion Point
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-3xl font-bold text-[#9f1239]">{highlights.confusionTitle}</div>
                   <p className="text-xs text-red-700/70 mt-1">{highlights.confusionDesc}</p>
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-red-800 bg-red-100/50 p-2 rounded border border-red-100/50">
                      <RefreshCcw className="h-3 w-3" /> {highlights.confusionStep}
                   </div>
                </CardContent>
             </Card>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-7 gap-6">
             {/* Left Col: Escalation & Confusion */}
             <div className="lg:col-span-4 space-y-6">
                
                {/* Why Tickets Escalate */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-[#2D3E2F]">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" /> 
                            Why Tickets Escalate
                        </CardTitle>
                        <CardDescription>Primary drivers for L1 to L2/L3 movement</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={escalationReasons}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {escalationReasons.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Where Customers Get Confused */}
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base text-[#2D3E2F]">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                             Where Customers Get Confused
                        </CardTitle>
                        <CardDescription>Confusion score based on chat keyword analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {confusionPoints.map((point) => (
                                <div key={point.name} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{point.name}</span>
                                        <span className="text-muted-foreground">{point.score}% friction</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 ease-out" 
                                            style={{ width: `${point.score}%`, backgroundColor: point.color }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
             </div>

             {/* Right Col: Missed Promises & Recurring */}
             <div className="lg:col-span-3 space-y-6">
                
                {/* Missed Promises */}
                <Card className="border-l-4 border-l-[#9f1239]">
                    <CardHeader>
                        <CardTitle className="text-base text-[#9f1239]">Missed Promises</CardTitle>
                        <CardDescription>Commitments made by agents that were not met</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {missedPromises.map((item) => (
                                <div key={item.id} className="p-3 bg-red-50/50 rounded-lg border border-red-100 flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-semibold text-[#7f1d1d]">{item.promise}</span>
                                        <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-red-100 text-[#9f1239]">{item.ticket}</span>
                                    </div>
                                    <div className="text-xs text-red-700/80 mt-1 flex justify-between">
                                        <span>Current: {item.current}</span>
                                        <span className="font-medium">Impact: {item.impact}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Agent Struggles - Radar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base text-[#2D3E2F]">Agent Performance Gaps</CardTitle>
                        <CardDescription>Areas where agents struggle (vs benchmark)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={struggles}>
                                    <PolarGrid stroke={colors.grid} />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: colors.slate }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: colors.slate }} />
                                    <Radar name="Agent Score" dataKey="A" stroke={colors.sage} fill={colors.sage} fillOpacity={0.4} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
             </div>
          </div>

          {/* Bottom: Recurring Issues */}
           <Card>
                <CardHeader>
                    <CardTitle className="text-base text-[#2D3E2F]">Recurring Technical Issues</CardTitle>
                    <CardDescription>Frequency of reported technical problems this period</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={recurringIssues} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={colors.grid} />
                                <XAxis type="number" tick={{fontSize: 12}} />
                                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill={colors.charcoal} radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </TabsContent>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <div className="grid grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-[#2D3E2F]">
                      {metric.value}
                    </span>
                    <span
                      className={`flex items-center text-sm ${
                        metric.trend === "up" ? "text-[#6f8551]" : "text-[#9f1239]"
                      }`}
                    >
                      {metric.trend === "up" ? (
                        <TrendingUp className="mr-0.5 h-3 w-3" />
                      ) : (
                        <TrendingDown className="mr-0.5 h-3 w-3" />
                      )}
                      {metric.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#2D3E2F]">
                Support Level Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Resolved</th>
                    <th className="pb-3 font-medium">Escalated</th>
                    <th className="pb-3 font-medium">Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { level: "L1 Support", resolved: 8542, escalated: 1203, rate: "87%" },
                    { level: "L2 Support", resolved: 2105, escalated: 312, rate: "87%" },
                    { level: "L3 Support", resolved: 385, escalated: 12, rate: "97%" },
                  ].map((row) => (
                    <tr key={row.level} className="border-b last:border-0 border-muted">
                      <td className="py-3 font-medium">{row.level}</td>
                      <td className="py-3">{row.resolved.toLocaleString()}</td>
                      <td className="py-3">{row.escalated.toLocaleString()}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-[#f0fdf4] px-2 py-0.5 text-xs font-medium text-[#15803d]">
                          {row.rate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TEAMS TAB --- */}
        <TabsContent value="teams" className="pt-4  animate-in fade-in slide-in-from-bottom-2">
          <div className="grid md:grid-cols-2 gap-6">
             <Card>
                <CardHeader>
                   <CardTitle className="text-base text-[#2D3E2F]">Team Workload Distribution</CardTitle>
                   <CardDescription>Active tickets per support pod</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart 
                            data={[
                               { team: 'Alpha (L1)', active: timeRange === '7d' ? 45 : 145, load: 'High' },
                               { team: 'Beta (L1)', active: timeRange === '7d' ? 38 : 98, load: 'Medium' },
                               { team: 'Gamma (L2)', active: timeRange === '7d' ? 15 : 45, load: 'Medium' },
                               { team: 'Delta (L3)', active: timeRange === '7d' ? 4 : 12, load: 'Low' },
                            ]}
                         >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                            <XAxis dataKey="team" tick={{fontSize: 12}} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="active" fill={colors.sage} radius={[4, 4, 0, 0]} barSize={40} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                   <CardTitle className="text-base text-[#2D3E2F]">Resolutions Leaderboard</CardTitle>
                   <CardDescription>Top performing agents (This Period)</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {[
                         { name: "Sarah J.", tickets: 142, rating: 4.9 },
                         { name: "Mike T.", tickets: 138, rating: 4.7 },
                         { name: "Jessica R.", tickets: 125, rating: 4.8 },
                         { name: "David L.", tickets: 110, rating: 4.5 },
                      ].map((agent, i) => (
                         <div key={agent.name} className="flex items-center justify-between p-2 rounded bg-muted/30">
                            <div className="flex items-center gap-3">
                               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#f0fdf4] text-[#15803d] text-xs font-bold">
                                  {i + 1}
                               </span>
                               <span className="font-medium text-sm">{agent.name}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                               <span className="text-muted-foreground">{agent.tickets} resolved</span>
                               <span className="font-semibold text-[#6f8551] flex items-center gap-1">
                                  <HeartHandshake className="h-3 w-3" /> {agent.rating}
                               </span>
                            </div>
                         </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
