import React, { useState, useEffect, useMemo, useRef } from 'react';
import ProfileView from './components/ProfileView';
import AuthModal from './components/AuthModal';
import ServiceCard from './components/ServiceCard';
import SignUpView from './components/AddServiceCardView';
import RatingModal from './components/RatingModal';
import SuperAdminDashboard, { AdminPage } from './components/SuperAdminDashboard';
import NotificationModal from './components/NotificationModal';
import InvoiceGenerator from './components/InvoiceGenerator';
import EventsPage from './components/EventsPage';
import GatePass from './components/GatePass';
import MyTicketsView from './components/MyTicketsView';
import CatalogueView from './components/CatalogueView';
import InvoiceHub from './components/InvoiceHub';
import MyDocumentsView from './components/MyDocumentsView';
import QuoteGenerator from './components/QuoteGenerator';
import BusinessAssets from './components/BusinessAssets';
import SearchPage from './components/SearchPage';
import BookingModal from './components/BookingModal';
import ReceiptGenerator from './components/ReceiptGenerator';
import InboxView from './components/InboxView';
import { MOCK_PROVIDERS, MOCK_USER_TICKETS, MOCK_CATALOGUE_ITEMS, MOCK_DOCUMENTS, MOCK_INVITATIONS, DEFAULT_BANNERS, REFERRAL_CODES, MOCK_SPECIAL_BANNERS } from './constants';
import type { ServiceProvider, Ticket, CatalogueItem, Document, Invitation, BusinessAssets as BusinessAssetsType, SpecialBanner } from './types';

type ViewMode = 'main' | 'profile' | 'signup' | 'admin' | 'invoice' | 'events' | 'gatepass' | 'contacts' | 'flagged' | 'myTickets' | 'catalogue' | 'invoiceHub' | 'quoteGenerator' | 'myDocuments' | 'search' | 'assets' | 'receiptGenerator' | 'inbox';
type QuickFilter = { type: 'category' | 'service'; value: string } | null;

export const CATEGORIES_DATA: Record<string, string[]> = {
    'Home': ['Electronics Expert', 'Professional Painter', 'Mama Fua (Laundry)', 'Electrician', 'Plumber'],
    'Transport': ['Boda Boda Rider', 'Taxi Driver', 'Moving Company'],
    'Emergency': ['Emergency Medical Services', 'Fire & Rescue'],
    'Gas': ['Gas Delivery', 'Gas Refill Station'],
    'Event': ['Event Planning & Catering', 'Wedding Planner'],
    'Personal': ['Makeup Artist', 'Personal Trainer', 'Academic Tutor'],
    'Delivery': ['Courier Services', 'Food Delivery'],
    'Travel': ['Tour Guide'],
};

const ComingSoonModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">Coming Soon!</h2>
            <p className="text-gray-600 mt-2">This feature is under construction. Stay tuned!</p>
            <button onClick={onClose} className="mt-4 w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg">OK</button>
        </div>
    </div>
);

const TopHeader: React.FC<{
  onMenuClick: () => void;
  onBackClick: () => void;
  viewMode: ViewMode;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasNotification: boolean;
  onNotificationClick: () => void;
  isScrolled: boolean;
  isAuthenticated: boolean;
  onAuthClick: () => void;
  onSearchFocus: () => void;
}> = ({ onMenuClick, onBackClick, viewMode, searchTerm, setSearchTerm, hasNotification, onNotificationClick, isScrolled, isAuthenticated, onAuthClick, onSearchFocus }) => {
  
  const isTransparent = viewMode === 'main' && !isScrolled;
  const showSearch = viewMode === 'search';

  const handleProtectedClick = (action: () => void) => {
      if (!isAuthenticated) {
          onAuthClick();
      } else {
          action();
      }
  }

  const searchInput = (
    <div className="relative">
        <input 
            type="text" 
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={onSearchFocus}
            autoFocus={viewMode === 'search'}
            className={`w-full py-2 pl-4 pr-10 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary bg-gray-100 text-gray-800 placeholder-gray-500`}
        />
        <svg className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    </div>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 max-w-sm mx-auto z-20 transition-colors duration-200 ${!isTransparent ? 'bg-white shadow-md' : 'bg-transparent'}`}>
         <div className="p-3 flex items-center h-[68px] gap-3">
             <div className="flex-shrink-0 w-10 text-left">
                 {viewMode === 'main' ? (
                    <button onClick={onMenuClick} className={`p-2 transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                ) : (
                    <button onClick={onBackClick} className="text-gray-700 p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                )}
            </div>

            {showSearch && <div className="flex-grow">{searchInput}</div>}

            <div className={`flex-shrink-0 w-10 text-right ${!showSearch ? 'ml-auto' : ''}`}>
                <button onClick={() => handleProtectedClick(onNotificationClick)} className={`relative p-2 transition-colors ${isTransparent ? 'text-white' : 'text-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    {hasNotification && <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500" />}
                </button>
            </div>
        </div>
    </header>
  );
};

export const CategoryFilter: React.FC<{
    quickFilter: QuickFilter;
    setQuickFilter: React.Dispatch<React.SetStateAction<QuickFilter>>;
    isAuthenticated: boolean;
    onAuthClick: () => void;
}> = ({ quickFilter, setQuickFilter, isAuthenticated, onAuthClick }) => {
    const [view, setView] = useState<'parents' | 'children'>('parents');
    const [selectedParent, setSelectedParent] = useState<string | null>('Home');

    const handleProtectedClick = (action: () => void) => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            action();
        }
    };

    const handleParentClick = (category: string) => {
        setSelectedParent(category);
        setView('children');
        setQuickFilter({ type: 'category', value: category });
    }
    const handleChildClick = (service: string) => {
        setQuickFilter({ type: 'service', value: service });
    }
    const handleBackToParents = () => {
        setView('parents');
        setQuickFilter({type: 'category', value: selectedParent || 'Home' });
    }
    
    const parentButtonClasses = (category: string) => {
        const isActive = selectedParent === category;
        return `px-3 py-1 text-xs font-bold rounded-full flex-shrink-0 border transition-colors ${isActive ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-700 border-gray-200'}`;
    };
    
    const childButtonClasses = (service: string) => {
        const isActive = quickFilter?.type === 'service' && quickFilter?.value === service;
        return `px-3 py-1 text-[11px] font-medium rounded-full flex-shrink-0 transition-colors ${isActive ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-700'}`;
    };

    return (
        <div className="py-2 px-3">
            {view === 'parents' ? (
                 <div className="flex space-x-3 overflow-x-auto no-scrollbar">
                    {Object.keys(CATEGORIES_DATA).map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => handleProtectedClick(() => handleParentClick(cat))}
                            className={parentButtonClasses(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                     <button onClick={() => handleProtectedClick(handleBackToParents)} className={`px-3 py-1 text-[11px] font-medium rounded-full flex-shrink-0 transition-colors bg-gray-200 text-gray-800`}>
                        &larr; All
                    </button>
                    {selectedParent && CATEGORIES_DATA[selectedParent]?.map(subCat => (
                        <button 
                            key={subCat} 
                            onClick={() => handleProtectedClick(() => handleChildClick(subCat))}
                            className={childButtonClasses(subCat)}
                        >
                            #{subCat}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Icons for MainPage Actions ---
const InvoiceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const GatepassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6.5-1H11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-1.5m-1 0V9a2 2 0 012-2h2a2 2 0 012 2v1.5m-7.5 4.5v2a2 2 0 002 2h2a2 2 0 002-2v-2" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9h.01M15 9h.01M9 15h.01M15 15h.01" /></svg>;
const EventsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.118 1.94 18 2.684 18 3.5A3.5 3.5 0 0114.5 7H11" /></svg>;


const MainPage: React.FC<{ 
    providers: ServiceProvider[];
    onSelectProvider: (provider: ServiceProvider) => void;
    onInvoiceClick: () => void;
    onEventsClick: () => void;
    onGatepassClick: () => void;
    isAuthenticated: boolean;
    onAuthClick: () => void;
    onSearchClick: () => void;
}> = ({ providers, onSelectProvider, onInvoiceClick, onEventsClick, onGatepassClick, isAuthenticated, onAuthClick, onSearchClick }) => {
    
    const mainActions = [
        { name: 'Documents', icon: <InvoiceIcon/>, action: onInvoiceClick },
        { name: 'Events', icon: <EventsIcon/>, action: onEventsClick },
        { name: 'Gatepass', icon: <GatepassIcon/>, action: onGatepassClick },
    ];
    
    const handleProtectedClick = (action: () => void) => {
        if (!isAuthenticated) {
            onAuthClick();
        } else {
            action();
        }
    };
    
    return (
         <div className="bg-gray-100 pb-28 min-h-screen">
            {/* Banner */}
            <div className="relative h-64 bg-brand-dark text-white flex flex-col justify-center items-center text-center p-6">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/seed/appbanner/600/400')` }}></div>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="relative z-10">
                    <h1 className="text-6xl font-bold text-white" style={{ lineHeight: 1, letterSpacing: '-0.05em' }}>
                        niko<br/>soko
                    </h1>
                    <p className="text-lg text-gray-200 mt-2">Your Gateway to Essential Services.</p>
                </div>
            </div>
            
            {/* Floating Search Bar */}
            <div className="relative px-4 z-10 -mt-6">
                <div 
                    onClick={onSearchClick}
                    className="bg-white rounded-full shadow-lg flex items-center p-2 cursor-pointer border border-gray-200"
                >
                    <span className="text-gray-500 flex-grow text-sm pl-3">I am looking for..</span>
                    <div className="bg-brand-primary text-white rounded-full p-2 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>
            </div>
            
            <div className="p-4 space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Tool Box</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {mainActions.map(action => (
                            <button key={action.name} onClick={() => handleProtectedClick(action.action)} className="bg-white p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 active:scale-95 text-center">
                                <div className="bg-gray-100 p-3 rounded-full text-brand-primary">{action.icon}</div>
                                <h3 className="font-semibold text-gray-800 text-xs">{action.name}</h3>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-gray-800">Nearby Services</h2>
                        <button className="text-sm font-semibold text-brand-primary hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {providers.map(provider => (
                            <ServiceCard key={provider.id} provider={provider} onClick={() => onSelectProvider(provider)} />
                        ))}
                        {providers.length === 0 && <p className="col-span-2 text-center text-gray-500 mt-8">No services found. Try adjusting your search.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SavedContactsView: React.FC<{
    allProviders: ServiceProvider[];
    savedContactIds: number[];
    onSelectProvider: (provider: ServiceProvider) => void;
}> = ({ allProviders, savedContactIds, onSelectProvider }) => {
    const savedProviders = useMemo(() => {
        return allProviders.filter(p => savedContactIds.includes(p.id));
    }, [allProviders, savedContactIds]);

    return (
        <div className="p-4">
            {savedProviders.length > 0 ? (
                 <div className="grid grid-cols-2 gap-4">
                    {savedProviders.map(provider => (
                        <ServiceCard key={provider.id} provider={provider} onClick={() => onSelectProvider(provider)} />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No saved contacts</h3>
                    <p className="mt-1 text-sm text-gray-500">You can save contacts from their profile page.</p>
                </div>
            )}
        </div>
    );
};

const FlaggedContentPage: React.FC<{
    providers: ServiceProvider[];
    onViewProvider: (provider: ServiceProvider) => void;
    onDeleteProvider: (id: number) => void;
}> = ({ providers, onViewProvider, onDeleteProvider }) => {
    const flaggedProviders = useMemo(() => {
        return providers.filter(p => p.flagCount > 0).sort((a,b) => b.flagCount - a.flagCount);
    }, [providers]);

    return (
        <div className="p-4 space-y-4">
             {flaggedProviders.length > 0 ? (
                flaggedProviders.map(p => (
                    <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between">
                        <button onClick={() => onViewProvider(p)} className="flex items-center gap-3 text-left">
                            <img src={p.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-semibold">{p.name}</p>
                                <p className="text-sm text-red-600 font-bold">Flagged {p.flagCount} time{p.flagCount > 1 ? 's' : ''}</p>
                            </div>
                        </button>
                        <button onClick={() => {if(window.confirm(`Delete ${p.name}?`)) onDeleteProvider(p.id)}} className="text-xs bg-red-100 text-red-700 px-3 py-2 rounded-md font-semibold">Delete</button>
                    </div>
                ))
             ) : (
                <p className="text-center text-gray-500 py-16">No flagged content found.</p>
             )}
        </div>
    )
};

const SideMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    onShowProfile: () => void;
    onShowContacts: () => void;
    onShowMyTickets: () => void;
    onShowCatalogue: () => void;
    onLogout: () => void;
    onShowAdminDashboard: () => void;
    onShowFlaggedContent: () => void;
    activeView: ViewMode;
}> = ({ isOpen, onClose, isAuthenticated, isSuperAdmin, onShowProfile, onShowContacts, onShowMyTickets, onShowCatalogue, onLogout, onShowAdminDashboard, onShowFlaggedContent, activeView }) => {
    
    const linkClasses = (views: ViewMode | ViewMode[]) => {
        const viewArray = Array.isArray(views) ? views : [views];
        const isActive = viewArray.includes(activeView);
        return `block w-full text-left px-6 py-3 transition-colors ${isActive ? 'bg-gray-700 text-white font-semibold' : 'text-gray-300 hover:bg-gray-700'}`;
    };

    return (
        <>
            <div 
                className={`fixed top-0 left-0 h-full w-64 bg-brand-dark shadow-xl transform transition-transform duration-200 z-50 overflow-y-auto no-scrollbar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 bg-black/20">
                    <h2 className="text-xl font-bold text-white">Niko Soko</h2>
                </div>
                <nav className="mt-6 flex flex-col h-[calc(100%-100px)] text-white">
                    <div>
                        <button onClick={onShowProfile} className={linkClasses(['profile', 'signup'])}>My Profile</button>
                        <button onClick={onShowContacts} className={linkClasses('contacts')}>My Contacts</button>
                        <button onClick={onShowMyTickets} className={linkClasses('myTickets')}>My Tickets</button>
                        <button onClick={onShowCatalogue} className={linkClasses('catalogue')}>My Catalogue</button>
                        {!isSuperAdmin && <button className={linkClasses([])}>Settings</button>}
                        {isSuperAdmin && (
                            <>
                                <button onClick={onShowFlaggedContent} className={linkClasses('flagged')}>Flagged Content</button>
                                <button 
                                    onClick={onShowAdminDashboard}
                                    className={`block w-full text-left px-6 py-3 font-bold transition-colors ${activeView === 'admin' ? 'bg-yellow-500 text-yellow-900' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'}`}
                                >
                                    ✨ Admin Dashboard
                                </button>
                            </>
                        )}
                    </div>

                    <div className="mt-auto">
                        {isAuthenticated && <button onClick={onLogout} className="block w-full text-left px-6 py-3 text-gray-300 hover:bg-gray-700 border-t border-gray-700" >Logout</button>}
                    </div>
                </nav>
            </div>
            <div className={`fixed inset-0 z-40 bg-black transition-opacity duration-200 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`} onClick={onClose} />
        </>
    );
};


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<ServiceProvider> | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ServiceProvider | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [isSideMenuOpen, setSideMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(null);
  const [unratedContacts, setUnratedContacts] = useState<ServiceProvider[]>([]);
  const [providerToRate, setProviderToRate] = useState<ServiceProvider | null>(null);
  const [providerToBook, setProviderToBook] = useState<ServiceProvider | null>(null);
  const [contactLimitReached, setContactLimitReached] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedContacts, setSavedContacts] = useState<number[]>([]);
  const [flaggedProfiles, setFlaggedProfiles] = useState<number[]>([]);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);
  
  const [providers, setProviders] = useState<ServiceProvider[]>(MOCK_PROVIDERS);
  const [allCatalogueItems, setAllCatalogueItems] = useState<CatalogueItem[]>(MOCK_CATALOGUE_ITEMS);
  const [categories, setCategories] = useState<string[]>(['Gas', 'Event', 'Travel', 'Delivery', 'Transport', 'Emergency', 'Home', 'Personal']);
  const [specialBanners, setSpecialBanners] = useState<SpecialBanner[]>(MOCK_SPECIAL_BANNERS);
  
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [myCatalogueItems, setMyCatalogueItems] = useState<CatalogueItem[]>([]);
  const [myDocuments, setMyDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS);
  const [businessAssets, setBusinessAssets] = useState<BusinessAssetsType>({
    name: 'Your Company Name',
    address: '123 Business Rd, Suite 456, Nairobi',
    logo: null,
  });
  const [adminInitialPage, setAdminInitialPage] = useState<AdminPage>('Dashboard');

  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollThreshold = 50;


  useEffect(() => {
    const container = mainContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
        setIsScrolled(container.scrollTop > scrollThreshold);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => container.removeEventListener('scroll', handleScroll);
  }, [viewMode]);


  const handleLogin = (phone: string) => {
    const normalizedPhone = phone.startsWith('0') ? phone.substring(1) : phone;
    if (normalizedPhone === '723119356') {
        setIsSuperAdmin(true);
    }
    
    const existingUser = providers.find(p => p.phone === phone);
    
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    
    if (existingUser){
        setCurrentUser(existingUser);
        setMyTickets(MOCK_USER_TICKETS);
        setMyCatalogueItems(allCatalogueItems.filter(item => item.providerId === existingUser.id));
    } else {
        const partialUser = {
            id: Date.now(),
            name: 'New User',
            phone,
            whatsapp: `254${normalizedPhone}`,
        };
        setCurrentUser(partialUser);
        setViewMode('main');
    }
  };
  
  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setCurrentUser(null);
    setSelectedProfile(null);
    setSideMenuOpen(false);
    myTickets.length = 0;
    myCatalogueItems.length = 0;
    setAdminInitialPage('Dashboard');
    setViewMode('main');
  }

  const handleUpdateProvider = (updatedProfile: ServiceProvider) => {
    setProviders(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    if (currentUser && currentUser.id === updatedProfile.id) {
        setCurrentUser(updatedProfile);
    }
    if (selectedProfile && selectedProfile.id === updatedProfile.id) {
        setSelectedProfile(updatedProfile);
    }
  }

  const handleDeleteProvider = (providerId: number) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    if (selectedProfile && selectedProfile.id === providerId) {
        setSelectedProfile(null);
        setViewMode('main');
    }
  };

  const handleFlagProvider = (providerId: number, reason: string) => {
    if (flaggedProfiles.includes(providerId)) return;
    
    setFlaggedProfiles(prev => [...prev, providerId]);
    
    const updatedProviders = providers.map(p => 
        p.id === providerId ? { ...p, flagCount: p.flagCount + 1 } : p
    );
    setProviders(updatedProviders);
    
    if (selectedProfile && selectedProfile.id === providerId) {
        setSelectedProfile(prev => prev ? { ...prev, flagCount: prev.flagCount + 1 } : null);
    }
    
    alert(`Thank you for your report. The profile has been flagged for: "${reason}".`);
  };

  const handleShowMyProfile = () => {
      setSideMenuOpen(false);
      if (isAuthenticated && currentUser) {
          if ('service' in currentUser) { 
            setSelectedProfile(currentUser as ServiceProvider);
            setViewMode('profile');
          } else { 
            setViewMode('signup');
          }
      } else {
          setAuthModalOpen(true);
      }
  }
  
    const handleSelectProvider = (provider: ServiceProvider) => {
      if (!isAuthenticated) {
          setAuthModalOpen(true);
          return;
      }
      setSelectedProfile(provider);
      setViewMode('profile');
  };

  const handleProfileCreation = (
      profileData: Omit<ServiceProvider, 'id' | 'name' | 'phone' | 'whatsapp' | 'flagCount' | 'views' | 'coverImageUrl' | 'isVerified' | 'cta'>,
      name: string,
      avatar: string | null,
      referralCode: string,
      cta: ServiceProvider['cta'],
  ) => {
      if (!currentUser) return;

      let isVerified = false;
      let coverImageUrl = DEFAULT_BANNERS[profileData.category] || 'https://picsum.photos/seed/defaultcover/600/400';
      let category = profileData.category;

      const code = referralCode.toUpperCase();
      if (REFERRAL_CODES[code]) {
          isVerified = REFERRAL_CODES[code].isVerified;
          coverImageUrl = REFERRAL_CODES[code].banner;
          category = REFERRAL_CODES[code].category;
      }

      const newUser: ServiceProvider = {
          ...currentUser,
          name,
          ...profileData,
          category,
          avatarUrl: avatar || `https://picsum.photos/seed/${name.replace(/\s/g, '')}/100/100`,
          coverImageUrl,
          isVerified,
          cta,
          flagCount: 0,
          views: 0,
      } as ServiceProvider;
      
      setProviders(prev => [...prev.filter(p => p.id !== newUser.id), newUser]);
      setCurrentUser(newUser);
      setViewMode('profile');
      setSelectedProfile(newUser);
  }
  
    const handleInitiateContact = (provider: ServiceProvider): boolean => {
      if (!isAuthenticated) {
          setAuthModalOpen(true);
          return false;
      }
      if (unratedContacts.length >= 5) {
          setProviderToRate(unratedContacts[0]);
          setContactLimitReached(true);
          return false; 
      }

      if (!unratedContacts.find(p => p.id === provider.id)) {
          setUnratedContacts(prev => [...prev, provider]);
      }
      return true; 
  };
  
  const handleSubmitRating = (ratedProvider: ServiceProvider, rating: number) => {
    console.log(`Rated ${ratedProvider.name} with ${rating} stars.`);
    setUnratedContacts(prev => prev.filter(p => p.id !== ratedProvider.id));
    setProviderToRate(null);
    setContactLimitReached(false);
  };
  
  const handleBack = () => {
      if (['invoice', 'quoteGenerator', 'myDocuments', 'assets', 'receiptGenerator'].includes(viewMode)) {
          setViewMode('invoiceHub');
          return;
      }
      if (['invoiceHub', 'search', 'inbox'].includes(viewMode)) {
          setViewMode('main');
          return;
      }

      if (viewMode === 'profile' && selectedProfile) {
          const justContactedProvider = unratedContacts.find(p => p.id === selectedProfile.id);
          if (justContactedProvider && !providerToRate) {
              setProviderToRate(justContactedProvider);
          }
      }
      setSelectedProfile(null);
      if (viewMode === 'flagged') {
          setViewMode('main'); 
      } else if (viewMode !== 'main') {
          setViewMode('main');
      }
  }

  const handleBroadcast = (message: string, filters: Record<string, string>) => {
      const filterString = Object.entries(filters)
            .filter(([, value]) => value !== 'All')
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

      setNotification({
        title: "Admin Broadcast",
        message: message
      });
      // Simulate filtering by showing an alert
      setTimeout(() => alert(`Broadcast sent! ${filterString ? `(Filters: ${filterString})` : ''}`), 100);
  };

  const handleToggleSaveContact = (providerId: number) => {
    setSavedContacts(prev => prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId]);
  };
  
  const handleTicketAcquired = (newTicket: Ticket) => {
    setMyTickets(prev => [...prev, newTicket]);
  };

  const handleAddBanner = (banner: Omit<SpecialBanner, 'id'>) => {
      const newBanner: SpecialBanner = {
          id: Date.now(),
          ...banner,
      };
      setSpecialBanners(prev => [newBanner, ...prev]);
  };

  const handleDeleteBanner = (bannerId: number) => {
      setSpecialBanners(prev => prev.filter(b => b.id !== bannerId));
  };
  
  const profileCatalogueItems = useMemo(() => {
    if (!selectedProfile) return [];
    return allCatalogueItems.filter(item => item.providerId === selectedProfile.id);
  }, [allCatalogueItems, selectedProfile]);

  const filteredProviders = useMemo(() => {
    let filtered = providers;

    if (quickFilter) {
        filtered = filtered.filter(p => {
            if (quickFilter.type === 'category') {
                return p.category === quickFilter.value;
            }
            if (quickFilter.type === 'service') {
                return p.service === quickFilter.value;
            }
            return true;
        });
    }

    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    const sorted = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm);
    return sorted;
  }, [searchTerm, quickFilter, providers]);

  if (viewMode === 'admin') {
    return <SuperAdminDashboard
        onBack={() => {
            setAdminInitialPage('Dashboard');
            setViewMode('main');
        }}
        providers={providers}
        onUpdateProvider={handleUpdateProvider}
        onDeleteProvider={handleDeleteProvider}
        onViewProvider={handleSelectProvider}
        categories={categories}
        onAddCategory={(name) => setCategories(prev => [...prev, name].sort())}
        onDeleteCategory={(name) => setCategories(prev => prev.filter(c => c !== name))}
        onBroadcast={handleBroadcast}
        initialPage={adminInitialPage}
        specialBanners={specialBanners}
        onAddBanner={handleAddBanner}
        onDeleteBanner={handleDeleteBanner}
    />
  }

  const renderContent = () => {
    const headerHeight = 68;
    const wrapInPadding = (component: React.ReactNode) => <div style={{ paddingTop: `${headerHeight}px` }}>{component}</div>;

    switch(viewMode) {
      case 'inbox':
        return wrapInPadding(<InboxView />);
      case 'search':
        return wrapInPadding(<SearchPage 
          providers={filteredProviders}
          onSelectProvider={handleSelectProvider}
          quickFilter={quickFilter}
          setQuickFilter={setQuickFilter}
          isAuthenticated={isAuthenticated}
          onAuthClick={() => setAuthModalOpen(true)}
        />);
      case 'invoiceHub':
        return wrapInPadding(<InvoiceHub 
            onNavigate={(view) => setViewMode(view as ViewMode)}
        />);
      case 'assets':
        return wrapInPadding(<BusinessAssets assets={businessAssets} onSave={setBusinessAssets} />);
      case 'myDocuments':
        return wrapInPadding(<MyDocumentsView documents={myDocuments} />);
      case 'receiptGenerator':
        return wrapInPadding(<ReceiptGenerator assets={businessAssets} />);
      case 'quoteGenerator':
        return wrapInPadding(<QuoteGenerator assets={businessAssets} />);
      case 'invoice':
        return wrapInPadding(<InvoiceGenerator assets={businessAssets} />);
      case 'events':
        return wrapInPadding(<EventsPage 
            isAuthenticated={isAuthenticated} 
            onAuthClick={() => setAuthModalOpen(true)}
            onTicketAcquired={handleTicketAcquired}
            currentUser={currentUser}
        />);
      case 'gatepass':
        return wrapInPadding(<GatePass
          currentUser={currentUser}
          isSuperAdmin={isSuperAdmin}
          isAuthenticated={isAuthenticated}
          invitations={invitations}
          onUpdateInvitations={setInvitations}
          onAuthClick={() => setAuthModalOpen(true)}
          onGoToSignup={() => setViewMode('signup')}
        />);
      case 'contacts':
        return wrapInPadding(<SavedContactsView 
            allProviders={providers} 
            savedContactIds={savedContacts} 
            onSelectProvider={handleSelectProvider} 
        />);
      case 'flagged':
        return wrapInPadding(<FlaggedContentPage 
            providers={providers}
            onViewProvider={handleSelectProvider}
            onDeleteProvider={handleDeleteProvider}
        />);
      case 'myTickets':
        return wrapInPadding(<MyTicketsView tickets={myTickets} />);
      case 'catalogue':
        return wrapInPadding(<CatalogueView 
            items={myCatalogueItems} 
            onUpdateItems={setMyCatalogueItems} 
            currentUser={currentUser as ServiceProvider}
            onUpdateUser={handleUpdateProvider}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setAuthModalOpen(true)}
            onInitiateContact={handleInitiateContact}
        />);
      case 'signup':
        return <SignUpView
            onBack={handleBack} onSave={handleProfileCreation} categories={categories}
            currentUser={currentUser}
        />
      case 'profile':
        if (selectedProfile) {
          return <ProfileView 
              profileData={selectedProfile} 
              isOwner={!!(currentUser && currentUser.id === selectedProfile.id)}
              isAuthenticated={isAuthenticated} isSuperAdmin={isSuperAdmin} onBack={handleBack}
              onLogout={handleLogout} onUpdate={handleUpdateProvider} onDelete={handleDeleteProvider}
              onContactClick={() => setAuthModalOpen(true)}
              onInitiateContact={handleInitiateContact}
              savedContacts={savedContacts}
              onToggleSaveContact={handleToggleSaveContact}
              catalogueItems={profileCatalogueItems}
              onBook={(provider) => setProviderToBook(provider)}
              isFlaggedByUser={flaggedProfiles.includes(selectedProfile.id)}
              onFlag={(reason) => handleFlagProvider(selectedProfile.id, reason)}
          />;
        }
        return null;
      case 'main':
      default:
        return <>
            <MainPage 
                providers={filteredProviders.slice(0, 6)} // Show limited on main
                onSelectProvider={handleSelectProvider}
                onInvoiceClick={() => setViewMode('invoiceHub')}
                onEventsClick={() => setViewMode('events')}
                onGatepassClick={() => setViewMode('gatepass')}
                isAuthenticated={isAuthenticated}
                onAuthClick={() => setAuthModalOpen(true)}
                onSearchClick={() => setViewMode('search')}
            />
        </>
    }
  }

  const showHeader = !['signup', 'profile'].includes(viewMode);

  return (
    <div ref={mainContainerRef} className="max-w-sm mx-auto bg-white font-sans h-screen overflow-y-auto overflow-x-hidden relative shadow-2xl no-scrollbar">
      <SideMenu 
          isOpen={isSideMenuOpen} onClose={() => setSideMenuOpen(false)}
          isAuthenticated={isAuthenticated} isSuperAdmin={isSuperAdmin}
          onShowProfile={handleShowMyProfile} onLogout={handleLogout}
          onShowContacts={() => { setViewMode('contacts'); setSideMenuOpen(false); }}
          onShowMyTickets={() => { setViewMode('myTickets'); setSideMenuOpen(false); }}
          onShowCatalogue={() => { setViewMode('catalogue'); setSideMenuOpen(false); }}
          onShowAdminDashboard={() => { setViewMode('admin'); setSideMenuOpen(false); }}
          onShowFlaggedContent={() => { setViewMode('flagged'); setSideMenuOpen(false); }}
          activeView={viewMode}
      />
      
      {showHeader && (
          <TopHeader 
            onMenuClick={() => setSideMenuOpen(true)} 
            onBackClick={handleBack}
            viewMode={viewMode}
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            hasNotification={true} onNotificationClick={() => setViewMode('inbox')}
            isScrolled={isScrolled}
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setAuthModalOpen(true)}
            onSearchFocus={() => { if(viewMode !== 'search') setViewMode('search'); }}
          />
      )}
      
      <main>
          {renderContent()}
      </main>
      
      {!isAuthenticated && !isAuthModalOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full px-4">
            <button 
            onClick={() => setAuthModalOpen(true)}
            className="bg-brand-dark text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-700 transition-transform hover:scale-105 w-full"
            >
            Sign in to continue
            </button>
        </div>
      )}

      {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} />}
      {providerToRate && (
        <RatingModal
            provider={providerToRate} onClose={() => setProviderToRate(null)}
            onSubmit={(rating) => handleSubmitRating(providerToRate, rating)}
            onNeverHappened={() => { setUnratedContacts(prev => prev.filter(p => p.id !== providerToRate.id)); setProviderToRate(null); }}
            limitReached={contactLimitReached}
        />
      )}
       {providerToBook && (
        <BookingModal
          provider={providerToBook}
          onClose={() => setProviderToBook(null)}
        />
      )}
      {notification && (
        <NotificationModal
            title={notification.title}
            message={notification.message}
            onClose={() => setNotification(null)}
        />
      )}
       {isComingSoonModalOpen && <ComingSoonModal onClose={() => setIsComingSoonModalOpen(false)} />}
    </div>
  );
}

export default App;