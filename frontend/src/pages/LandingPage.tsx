import React from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  TrendingUp, 
  MessageSquare, 
  FileText, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  Mail,
  Lock,
  Sparkles,
  Search,
  PieChart,
  Users
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Footer } from "../components/Footer";

// Live preview mockup data for hero section
const previewData = [
  { name: "Jan", Sales: 4200, Forecast: 4200 },
  { name: "Feb", Sales: 4900, Forecast: 4900 },
  { name: "Mar", Sales: 5600, Forecast: 5600 },
  { name: "Apr", Sales: 6200, Forecast: 6200 },
  { name: "May", Sales: 5800, Forecast: 5800 },
  { name: "Jun", Sales: 7200, Forecast: 7200 },
  { name: "Jul", Forecast: 8100 },
  { name: "Aug", Forecast: 8900 },
  { name: "Sep", Forecast: 9700 },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg relative overflow-x-hidden flex flex-col justify-between">
      {/* Background neon blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-brand-cyan/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-brand-blue/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[100px] pointer-events-none" />

      {/* Navigation header */}
      <header className="h-20 border-b border-brand-border/60 bg-brand-bg/50 backdrop-blur-md sticky top-0 z-50 px-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="AUCTUS Logo" className="h-10 w-10 rounded-xl object-cover shadow-cyan-glow" />
          <div>
            <span className="font-extrabold text-lg text-brand-text tracking-wide block leading-none">AUCTUS</span>
            <span className="text-[9px] text-brand-cyan tracking-wider font-semibold uppercase mt-0.5 block">AI Business growth cockpit</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-brand-muted hover:text-brand-text transition">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-xs font-bold bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/35 text-brand-cyan shadow-cyan-glow rounded-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-12 gap-12 items-center w-full">
        <div className="md:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Empowered by Gemini API & XGBoost</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-brand-text leading-tight tracking-tight">
            Empowering Local <br className="hidden sm:inline" />
            Businesses Through <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue neon-text-glow">
              AI & Data Analytics
            </span>
          </h1>
          <p className="text-sm md:text-base text-brand-muted max-w-xl leading-relaxed">
            Stop guessing. AUCTUS transforms your raw daily sales transaction logs and customer comments into predictive revenue timelines, customer persona segmentations, SWOT audits, and branded advisor documents.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg font-extrabold text-sm shadow-cyan-glow transition-all flex items-center gap-2 group"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-lg bg-brand-border/40 hover:bg-brand-border/70 border border-brand-border text-brand-text font-bold text-sm transition-all"
            >
              Launch Live Demo
            </Link>
          </div>
        </div>

        {/* Live Chart Preview right */}
        <div className="md:col-span-5 w-full glass-panel p-6 border-brand-cyan/10 shadow-cyan-glow relative">
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-success/15 border border-brand-success/20 text-[9px] text-brand-success font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-success animate-ping" />
            <span>Interactive Live Forecast</span>
          </div>
          
          <div className="mb-4">
            <span className="text-[10px] text-brand-muted font-bold block uppercase tracking-wider">Revenue Projection</span>
            <span className="text-xl font-extrabold text-brand-text">$9,700/mo</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={previewData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={9} />
                <YAxis stroke="#475569" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "10px" }}
                  itemStyle={{ fontSize: "12px", color: "#f8fafc" }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="Forecast" stroke="#06b6d4" strokeDasharray="3 3" fillOpacity={1} fill="url(#colorForecast)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-brand-card/25 border-y border-brand-border/60 py-16 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-brand-text">Platform Capabilities</h2>
            <p className="text-xs text-brand-muted mt-2">
              Everything local merchants need to run predictive intelligence dashboards.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            <div className="glass-panel p-6 hover:border-brand-cyan/20 transition duration-300">
              <TrendingUp className="h-8 w-8 text-brand-cyan mb-4" />
              <h3 className="text-base font-bold text-brand-text">Sales Forecasting</h3>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                Uses Prophet and XGBoost to project cash flows and sales volume 30 to 365 days into the future with dynamic confidence margins.
              </p>
            </div>
            
            <div className="glass-panel p-6 hover:border-brand-cyan/20 transition duration-300">
              <MessageSquare className="h-8 w-8 text-brand-cyan mb-4" />
              <h3 className="text-base font-bold text-brand-text">AI Growth Chat</h3>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                Speak directly with AUCTUS, your dataset-aware advisor. Ask questions about dips, top products, or local advertising tricks.
              </p>
            </div>

            <div className="glass-panel p-6 hover:border-brand-cyan/20 transition duration-300">
              <Users className="h-8 w-8 text-brand-cyan mb-4" />
              <h3 className="text-base font-bold text-brand-text">Customer Segments</h3>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                Applies unsupervised KMeans clustering to auto-group customers into Loyal Champions, At-Risk Sleepers, or New Spenders.
              </p>
            </div>

            <div className="glass-panel p-6 hover:border-brand-cyan/20 transition duration-300">
              <PieChart className="h-8 w-8 text-brand-cyan mb-4" />
              <h3 className="text-base font-bold text-brand-text">Customer Sentiment</h3>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                Ingest customer review sheets, plot positive/negative distribution charts, and generate keyword clouds alongside AI summaries.
              </p>
            </div>

            <div className="glass-panel p-6 hover:border-brand-cyan/20 transition duration-300">
              <Search className="h-8 w-8 text-brand-cyan mb-4" />
              <h3 className="text-base font-bold text-brand-text">Competitor SWOT</h3>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                Input competitor names to auto-generate positioning matrix records, local pricing audits, and SWOT evaluations.
              </p>
            </div>

            <div className="glass-panel p-6 hover:border-brand-cyan/20 transition duration-300">
              <FileText className="h-8 w-8 text-brand-cyan mb-4" />
              <h3 className="text-base font-bold text-brand-text">Report Generation</h3>
              <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                Compile analytics instantly into branded PDF, Word, and PowerPoint presentation slides ready to show stakeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full text-center">
        <h2 className="text-3xl font-extrabold text-brand-text mb-2">Merchant Success Stories</h2>
        <p className="text-xs text-brand-muted mb-12">See how local business owners are leveraging AUCTUS.</p>
        
        <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          <div className="glass-panel p-6 border-brand-cyan/5">
            <p className="text-xs text-brand-muted italic leading-relaxed">
              "We uploaded our Shopify CSV logs and instantly got a 90-day forecast. AUCTUS alerted us to stock up on espresso blend ahead of the summer rush, which saved our margins! The project is beautifully put together."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-9 w-9 rounded-full bg-brand-cyan/15 flex items-center justify-center font-bold text-xs text-brand-cyan">
                CH
              </div>
              <div>
                <span className="text-xs font-bold block text-brand-text">Coffee Haven Café</span>
                <span className="text-[10px] text-brand-muted block">Downtown Zipcode</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 border-brand-cyan/5">
            <p className="text-xs text-brand-muted italic leading-relaxed">
              "The customer sentiment word cloud highlighted that clients disliked our slow delivery. We adjusted our routes based on the marketing engine’s priority roadmap. A world-class advisor platform created by Aryan Pandey!"
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-9 w-9 rounded-full bg-brand-cyan/15 flex items-center justify-center font-bold text-xs text-brand-cyan">
                KB
              </div>
              <div>
                <span className="text-xs font-bold block text-brand-text">Boutique Wardrobe</span>
                <span className="text-[10px] text-brand-muted block">Regional Retailer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tier */}
      <section className="bg-brand-card/25 border-t border-brand-border/60 py-16 w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-brand-text mb-2">Simple, Flexible Pricing</h2>
          <p className="text-xs text-brand-muted mb-12">All local business features are accessible without friction.</p>

          <div className="grid sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Free */}
            <div className="glass-panel p-8 text-left space-y-6 relative border-brand-border">
              <div>
                <span className="text-xs font-bold text-brand-muted uppercase block">Developer Sandbox</span>
                <span className="text-2xl font-black text-brand-text mt-1.5 block">Free</span>
              </div>
              <p className="text-xs text-brand-muted">
                Perfect for evaluating advisor capabilities with mock datasets.
              </p>
              <ul className="space-y-3.5 text-xs text-brand-text">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-brand-cyan" />
                  <span>Interactive sales dashboard</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-brand-cyan" />
                  <span>Gemini sandbox chat limits</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-brand-cyan" />
                  <span>Clean up 1 sample dataset</span>
                </li>
              </ul>
              <Link to="/signup" className="w-full py-2.5 block text-center rounded-lg bg-brand-border/40 hover:bg-brand-border/80 border border-brand-border text-xs font-bold transition">
                Start Sandbox
              </Link>
            </div>

            {/* Premium */}
            <div className="glass-panel p-8 text-left space-y-6 relative border-brand-cyan/30 shadow-cyan-glow">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-brand-cyan text-brand-bg text-[10px] font-black uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <span className="text-xs font-bold text-brand-cyan uppercase block">Merchant Pro</span>
                <span className="text-2xl font-black text-brand-text mt-1.5 block">
                  $49<span className="text-xs text-brand-muted font-normal">/month</span>
                </span>
              </div>
              <p className="text-xs text-brand-muted">
                Advanced machine learning diagnostics and unlimited SWOT audits.
              </p>
              <ul className="space-y-3.5 text-xs text-brand-text">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-brand-cyan" />
                  <span>Unlimited Ingestion (CSV/JSON/Excel)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-brand-cyan" />
                  <span>XGBoost Sales forecasting timeline</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-brand-cyan" />
                  <span>PDF, Word, PowerPoint exports</span>
                </li>
              </ul>
              <Link to="/signup" className="w-full py-2.5 block text-center rounded-lg bg-brand-cyan hover:bg-brand-cyanLight text-brand-bg font-bold text-xs transition shadow-cyan-glow">
                Unlock Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <h2 className="text-3xl font-extrabold text-brand-text text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="glass-panel p-5 text-left border-brand-border">
            <h4 className="text-xs font-extrabold text-brand-text flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-brand-cyan" />
              <span>How does automated data cleaning operate?</span>
            </h4>
            <p className="text-xs text-brand-muted mt-2 pl-6.5 leading-relaxed">
              When you upload a transaction spreadsheet, the cleaning engine automatically maps columns, fills empty sales figures with median prices, drops duplicates, and caps extreme outliers using statistical methods, showing you an AI-translated change explanation.
            </p>
          </div>
          
          <div className="glass-panel p-5 text-left border-brand-border">
            <h4 className="text-xs font-extrabold text-brand-text flex items-center gap-2.5">
              <HelpCircle className="h-4 w-4 text-brand-cyan" />
              <span>Is my sales database secure?</span>
            </h4>
            <p className="text-xs text-brand-muted mt-2 pl-6.5 leading-relaxed">
              Absolutely. We isolate datasets per business user, utilize JWT bearer tokens for session management, and log all profile changes in the audit logs table.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
