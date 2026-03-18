import MigrationTrigger from './components/MigrationTrigger';
import { Zap, ShieldCheck, BarChart3, UploadCloud, Globe, Cpu } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-black dark:text-white fill-current" />
            <span className="font-bold text-xl tracking-tight">MigrateOptima</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-900/30">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Docker Engine: Active
            </div>
            <nav className="flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">Docs</a>
              <button className="text-sm font-medium px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-90 transition-opacity">Deploy Platform</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-4">Migration Research Dashboard</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                A scientific interface for orchestrating heterogeneous database migrations. Test tools, measure throughput, and verify integrity in real-time.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center p-4 rounded-xl bg-white border dark:bg-zinc-900 dark:border-zinc-800 shadow-sm min-w-[120px]">
                <span className="text-2xl font-bold">18</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Migrations Run</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl bg-white border dark:bg-zinc-900 dark:border-zinc-800 shadow-sm min-w-[120px]">
                <span className="text-2xl font-bold">0.2s</span>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Avg Latency</span>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Controllers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-zinc-400" />
              <h2 className="text-xl font-bold">Standard Research Scenarios</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MigrationTrigger dbName="blog_db" />
              <MigrationTrigger dbName="ecommerce_db" />
              <MigrationTrigger dbName="erp_db" />
              <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                <BarChart3 className="w-8 h-8 text-zinc-300" />
                <p className="text-xs font-medium text-zinc-400">Add custom scenario in .env</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <UploadCloud className="w-5 h-5 text-zinc-400" />
              <h2 className="text-xl font-bold">User Dataset Upload</h2>
            </div>
            <MigrationTrigger dbName="user_custom" isCustom={true} />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t dark:border-zinc-900">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h4 className="font-bold mb-1">Ephemeral Orchestration</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">Containers are created on-demand using the Docker API and cleaned up automatically post-migration.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h4 className="font-bold mb-1">Integrity Analysis</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">Integrated schema-fidelity checks ensure that constraints, primary keys, and data types remain consistent.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h4 className="font-bold mb-1">Throughput Metrics</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">High-resolution performance monitoring captures rows-per-second and I/O overhead per migration tool.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-24 border-t py-12 dark:border-zinc-900 bg-white dark:bg-black">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-sm tracking-tight text-zinc-500 uppercase">MigrateOptima v1.0.4</span>
          </div>
          <p className="text-sm text-zinc-500 italic max-w-sm text-center md:text-right">
            "Developed for Thesis Research into the efficiency of Heterogeneous Database Migration Tools."
          </p>
        </div>
      </footer>
    </div>
  );
}
