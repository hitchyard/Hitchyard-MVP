"use client"
import React, { useState } from 'react';
import { LayoutDashboard, Truck, Wallet, FileText, Menu } from 'lucide-react';

// --- Static Data & Components ---

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard },
        { name: "Loads Dispatch", icon: Truck },
        { name: "Finance Ledger", icon: Wallet },
        { name: "Compliance Check", icon: FileText },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={toggleSidebar}
            />

            {/* Sidebar Structure */}
            <aside className={`bg-trust-deep-green text-white w-64 fixed md:static h-full transition-transform transform md:translate-x-0 p-4 border-r border-gray-700 z-30
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-extrabold font-cinzel tracking-widest flex items-baseline">
                        <span className="text-5xl text-accent-green mr-1">H</span>Y
                    </h1>
                    <button 
                        className="p-2 md:hidden hover:bg-authority-charcoal rounded-md"
                        onClick={toggleSidebar}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <div
                            key={item.name}
                            className={`flex items-center p-3 rounded-lg font-spartan font-semibold uppercase tracking-wider cursor-pointer transition duration-150 border border-transparent 
                                ${item.name === 'Dashboard' 
                                    ? 'bg-authority-charcoal border-accent-green text-accent-green' 
                                    : 'hover:bg-authority-charcoal/70'
                                }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

const Header = ({ toggleSidebar }) => (
    <header className="flex items-center justify-between p-4 bg-authority-charcoal border-b border-gray-700 shadow-md">
        <button 
            className="p-2 md:hidden hover:bg-gray-700 rounded-md text-white"
            onClick={toggleSidebar}
        >
            <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-cinzel font-bold text-white hidden md:block">
            SYSTEM CONTROL PANEL
        </h2>
        <div className="text-sm font-spartan text-ui-subtle">
            Verified User Access
            <span className="ml-2 px-2 py-1 bg-trust-deep-green rounded text-accent-green font-mono">
                UID: 1c32-a5d9-hcy-783
            </span>
        </div>
    </header>
);

const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-bg-card p-6 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-spartan font-bold text-ui-subtle uppercase tracking-wider">{title}</h3>
            <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
        <p className={`mt-4 text-4xl font-cinzel font-bold ${colorClass}`}>{value}</p>
    </div>
);

// --- Main App Component ---
export default function DashboardShell() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 overflow-y-auto md:ml-64">
                {/* Header */}
                <Header toggleSidebar={toggleSidebar} />
                
                {/* Main Dashboard Grid */}
                <main className="flex-1 p-6 space-y-8">
                    
                    <h1 className="text-4xl font-cinzel font-bold text-white border-b border-gray-800 pb-3 uppercase">
                        Active Dispatch Authority
                    </h1>

                    {/* Metric Cards (Order and Structure) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard 
                            title="Credit Authority Score" 
                            value="A+" 
                            icon={Wallet} 
                            colorClass="text-accent-green" 
                        />
                        <MetricCard 
                            title="Loads In Transit" 
                            value="1,402" 
                            icon={Truck} 
                            colorClass="text-white" 
                        />
                        <MetricCard 
                            title="Settled Contracts" 
                            value="$8.4M" 
                            icon={FileText} 
                            colorClass="text-ui-subtle" 
                        />
                        <MetricCard 
                            title="System Status" 
                            value="Nominal" 
                            icon={LayoutDashboard} 
                            colorClass="text-accent-green" 
                        />
                    </div>

                    {/* Compliance and Ledger Section */}
                    <div className="bg-bg-card p-8 rounded-xl border border-gray-700 shadow-xl">
                        <h2 className="text-2xl font-cinzel font-bold text-white mb-4 uppercase">
                            Compliance and Verification Ledger
                        </h2>
                        <p className="text-ui-subtle font-spartan mb-6">
                            This ledger contains the immutable record of all verified partner and carrier data within the Hitchyard network. Compliance status is updated in real-time.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-authority-charcoal p-4 rounded-lg border border-gray-800">
                                <p className="text-lg font-semibold text-accent-green flex items-center">
                                    <FileText className="w-5 h-5 mr-2"/>
                                    Document Verification
                                </p>
                                <p className="text-white mt-2">All required operating licenses verified and current.</p>
                            </div>
                            <div className="bg-authority-charcoal p-4 rounded-lg border border-gray-800">
                                <p className="text-lg font-semibold text-accent-green flex items-center">
                                    <Wallet className="w-5 h-5 mr-2"/>
                                    Payment Integrity
                                </p>
                                <p className="text-white mt-2">100% on-time settlement rate over 12 months.</p>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}