import { useState, useEffect } from 'react';
import { Activity, Database, Menu, X, Settings, LogOut, FileText, Zap, Shield } from 'lucide-react';

import favicon from '../assets/favicon.svg';
import RathinamTextLogo from '../assets/RathinamTextLogo';

const getInitialThemeName = (storedTheme) => {
    if (storedTheme === 'custom') return 'Mercury Glass';
    if (storedTheme === 'dark-glass') return 'Dark Glass';
    if (storedTheme === 'rathinam-light') return 'Rathinam Light';
    if (storedTheme === 'rathinam-dark') return 'Rathinam Dark';
    if (storedTheme === 'rathinam-3d') return 'Rathinam 3D';
    return 'Dark Default';
};

const getInitialThemeBase = (storedTheme) => {
    if (storedTheme === 'rathinam-light' || storedTheme === 'custom') return 'light';
    return 'dark';
};

const Sidebar = ({ currentView, onNavigate, userPermissions = [] }) => {
    const storedTheme = localStorage.getItem('pt_theme');
    
    const [openGroup, setOpenGroup] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [themeName, setThemeName] = useState(getInitialThemeName(storedTheme));
    const [theme, setTheme] = useState(getInitialThemeBase(storedTheme));

    useEffect(() => {
        if (isCollapsed) {
            document.body.classList.add('sidebar-collapsed');
        } else {
            document.body.classList.remove('sidebar-collapsed');
        }
    }, [isCollapsed]);

    useEffect(() => {
        if (storedTheme) {
            document.body.classList.add(`theme-${storedTheme}`);
        }
    }, [storedTheme]);

    const handleToggleGroup = (groupName) => {
        if (isCollapsed) return;
        setOpenGroup(prev => prev === groupName ? null : groupName);
    };

    const hasPerm = (viewName) => {
        if (userPermissions === 'ALL') return true;
        const viewPerms = userPermissions?.[viewName];
        return viewPerms && viewPerms.includes('view');
    };

    const isActive = (viewName) => currentView === viewName ? 'nav-link active' : 'nav-link';

    const closeMobileMenu = () => setMobileMenuOpen(false);

    const handleNav = (viewName) => {
        onNavigate(viewName);
        closeMobileMenu();
    }

    const toggleThemeCycle = () => {
        const body = document.body;
        const themes = ['theme-custom', 'theme-dark-glass', 'theme-rathinam-light', 'theme-rathinam-dark', 'theme-rathinam-3d'];
        const currentTheme = themes.find(t => body.classList.contains(t));

        body.classList.remove(...themes);

        if (!currentTheme) {
            body.classList.add('theme-custom');
            localStorage.setItem('pt_theme', 'custom');
            setThemeName('Mercury Glass');
            setTheme('light');
        } else if (currentTheme === 'theme-custom') {
            body.classList.add('theme-dark-glass');
            localStorage.setItem('pt_theme', 'dark-glass');
            setThemeName('Dark Glass');
            setTheme('dark');
        } else if (currentTheme === 'theme-dark-glass') {
            body.classList.add('theme-rathinam-light');
            localStorage.setItem('pt_theme', 'rathinam-light');
            setThemeName('Rathinam Light');
            setTheme('light');
        } else if (currentTheme === 'theme-rathinam-light') {
            body.classList.add('theme-rathinam-dark');
            localStorage.setItem('pt_theme', 'rathinam-dark');
            setThemeName('Rathinam Dark');
            setTheme('dark');
        } else if (currentTheme === 'theme-rathinam-dark') {
            body.classList.add('theme-rathinam-3d');
            localStorage.setItem('pt_theme', 'rathinam-3d');
            setThemeName('Rathinam 3D');
            setTheme('dark');
        } else {
            localStorage.setItem('pt_theme', 'dark');
            setThemeName('Dark Default');
            setTheme('dark');
        }
    };

    return (
        <>
            <button className={`mobile-sidebar-toggle ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className="icon">{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</span>
            </button>

            {mobileMenuOpen && <div className="sidebar-overlay" onClick={closeMobileMenu}></div>}

            <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header relative" style={{ padding: isCollapsed ? '1.5rem 0' : '1.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
                    <div 
                        onClick={() => { 
                            if (!isCollapsed) setOpenGroup(null);
                            setIsCollapsed(!isCollapsed); 
                        }} 
                        style={{ cursor: 'pointer', display: 'flex', flexDirection: isCollapsed ? 'column' : 'row', alignItems: 'center', gap: isCollapsed ? '4px' : '12px', width: '100%', justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <img src={favicon} alt="Logo" style={{ width: '45px', height: '45px', flexShrink: 0 }} />
                        {isCollapsed ? (
                            <div className="animate-fade-in mt-1">
                                <RathinamTextLogo width="45px" fillPrimary={theme === 'light' ? '#009CDE' : '#00f3ff'} />
                            </div>
                        ) : (
                            <div className="flex flex-col animate-fade-in" style={{ alignItems: 'flex-start' }}>
                                <RathinamTextLogo width="80px" fillPrimary={theme === 'light' ? '#009CDE' : '#00f3ff'} />
                                <div className="mt-1 leading-tight text-left">
                                    <div className="font-bold text-slate-200 tracking-wider hover:text-white transition-colors" style={{ fontSize: '0.65rem' }}>POWERTRACKER</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sidebar-scrollable custom-scrollbar">
                    <ul className="sidebar-menu">
                        {!isCollapsed && <li className="menu-heading">Main Navigation</li>}

                        <li>
                            <div onClick={() => handleNav('Dashboard')} className={isActive('Dashboard')} title="Dashboard">
                                <span className="icon"><Activity size={18} /></span> <span className="nav-text">Dashboard</span>
                            </div>
                        </li>

                        <li className="menu-group">
                            <div className={`nav-link group-header ${openGroup === 'operations' ? 'open' : ''}`} onClick={() => handleToggleGroup('operations')} title="Operations">
                                <span className="flex items-center flex-1"><span className="icon"><Settings size={18} /></span> <span className="nav-text">Operations</span></span> <span className="chevron">{openGroup === 'operations' ? '▾' : '▸'}</span>
                            </div>
                            <div className={`group-items ${openGroup === 'operations' ? 'expanded' : ''}`}>
                                {hasPerm('EB Meter Reading') && <a className={isActive('EB Meter Reading')} onClick={() => handleNav('EB Meter Reading')}>EB Meter Reading</a>}
                                {hasPerm('Genset Reading') && <a className={isActive('Genset Reading')} onClick={() => handleNav('Genset Reading')}>Genset Reading</a>}
                                {hasPerm('Diesel Entry') && <a className={isActive('Diesel Entry')} onClick={() => handleNav('Diesel Entry')}>Diesel Entry</a>}
                                {hasPerm('Power Cut Entry') && <a className={isActive('Power Cut Entry')} onClick={() => handleNav('Power Cut Entry')}>Power Cut Entry</a>}
                                {hasPerm('Power House Complaints') && <a className={isActive('Power House Complaints')} onClick={() => handleNav('Power House Complaints')}>Power House Complaints</a>}
                            </div>
                        </li>

                        <li className="menu-group">
                            <div className={`nav-link group-header ${openGroup === 'master-data' ? 'open' : ''}`} onClick={() => handleToggleGroup('master-data')} title="Master Data">
                                <span className="flex items-center flex-1"><span className="icon"><Database size={18} /></span> <span className="nav-text">Master Data</span></span> <span className="chevron">{openGroup === 'master-data' ? '▾' : '▸'}</span>
                            </div>
                            <div className={`group-items ${openGroup === 'master-data' ? 'expanded' : ''}`}>
                                {hasPerm('Company') && <a className={isActive('Company')} onClick={() => handleNav('Company')}>Company</a>}
                                {hasPerm('Categories') && <a className={isActive('Categories')} onClick={() => handleNav('Categories')}>Categories</a>}
                                {hasPerm('Blocks') && <a className={isActive('Blocks')} onClick={() => handleNav('Blocks')}>Blocks</a>}
                                {hasPerm('Gensets') && <a className={isActive('Gensets')} onClick={() => handleNav('Gensets')}>Gensets</a>}
                                {hasPerm('Tax Rates') && <a className={isActive('Tax Rates')} onClick={() => handleNav('Tax Rates')}>Tax Rates</a>}
                                {hasPerm('Diesel Prices') && <a className={isActive('Diesel Prices')} onClick={() => handleNav('Diesel Prices')}>Diesel Prices</a>}
                                {hasPerm('Billing Units') && <a className={isActive('Billing Units')} onClick={() => handleNav('Billing Units')}>Billing Units</a>}
                            </div>
                        </li>

                        <li className="menu-group">
                            <div className={`nav-link group-header ${openGroup === 'reports' ? 'open' : ''}`} onClick={() => handleToggleGroup('reports')} title="Reports">
                                <span className="flex items-center flex-1"><span className="icon"><FileText size={18} /></span> <span className="nav-text">Reports</span></span> <span className="chevron">{openGroup === 'reports' ? '▾' : '▸'}</span>
                            </div>
                            <div className={`group-items ${openGroup === 'reports' ? 'expanded' : ''}`}>
                                {hasPerm('DG Bill') && <a className={isActive('DG Bill')} onClick={() => handleNav('DG Bill')}>DG Bill</a>}
                                {hasPerm('EB Bill Block-wise') && <a className={isActive('EB Bill Block-wise')} onClick={() => handleNav('EB Bill Block-wise')}>EB Bill Block-wise</a>}
                                {hasPerm('EB Bill Category-wise') && <a className={isActive('EB Bill Category-wise')} onClick={() => handleNav('EB Bill Category-wise')}>EB Bill Category-wise</a>}
                                {hasPerm('Month-wise Summary') && <a className={isActive('Month-wise Summary')} onClick={() => handleNav('Month-wise Summary')}>Month-wise Summary</a>}
                                {hasPerm('Power Cut Details') && <a className={isActive('Power Cut Details')} onClick={() => handleNav('Power Cut Details')}>Power Cut Details</a>}
                                {hasPerm('Power House Complaints Report') && <a className={isActive('Power House Complaints Report')} onClick={() => handleNav('Power House Complaints Report')}>Power House Complaints Report</a>}
                            </div>
                        </li>

                        <li className="menu-group">
                            <div className={`nav-link group-header ${openGroup === 'admin' ? 'open' : ''}`} onClick={() => handleToggleGroup('admin')} title="Administration">
                                <span className="flex items-center flex-1"><span className="icon"><Shield size={18} /></span> <span className="nav-text">Administration</span></span> <span className="chevron">{openGroup === 'admin' ? '▾' : '▸'}</span>
                            </div>
                            <div className={`group-items ${openGroup === 'admin' ? 'expanded' : ''}`}>
                                {hasPerm('User Management') && <a className={isActive('User Management')} onClick={() => handleNav('User Management')}>User Management</a>}
                            </div>
                        </li>

                    </ul>
                </div>

                <div className="sidebar-footer border-t border-slate-800 p-4 flex flex-col gap-2">
                    <button
                        className={`flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-colors w-full bg-slate-800/50 text-slate-300 hover:bg-slate-700`}
                        onClick={toggleThemeCycle}
                        title="Toggle Theme"
                    >
                        <Zap size={18} className="shrink-0" />
                        {!isCollapsed && <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{themeName}</span>}
                    </button>
                    <button
                        className="flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer transition-colors w-full bg-red-900/40 text-red-400 hover:bg-red-800/60"
                        onClick={() => {
                            localStorage.removeItem('pt_token');
                            window.location.reload();
                        }}
                        title="Log Off"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!isCollapsed && <span className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">Log Off</span>}
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Sidebar;
