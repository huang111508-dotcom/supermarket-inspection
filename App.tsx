
import React, { useState, useEffect, useRef } from 'react';
import { InspectionData, ViewState, Deduction, EmployeeConfig, InspectionRecord, AppConfig, Areas, Item, Standard } from './types';
import { INITIAL_AREAS } from './data';
import { exportToExcel } from './utils/excelExport';

// Firebase Imports
import { db } from './firebaseConfig';
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    onSnapshot, 
    deleteDoc, 
    doc, 
    setDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove,
    getDoc
} from 'firebase/firestore';

const App: React.FC = () => {
    // Helper to get current month string "YYYY-MM"
    const getCurrentMonthStr = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    // Application State
    const [inspectionData, setInspectionData] = useState<InspectionData>(() => ({
        inspector: '',
        shop: '龙城店', // Default shop
        date: '',
        areas: JSON.parse(JSON.stringify(INITIAL_AREAS)),
        records: [] 
    }));

    const [appConfig, setAppConfig] = useState<AppConfig>({
        stores: ['龙城店'],
        areas: [
            { key: 'vegetables', label: '蔬果区' },
            { key: 'grocery', label: '食百区' },
            { key: 'seafood', label: '水产区' },
            { key: 'meat', label: '肉品区' },
            { key: 'deli', label: '熟食区' },
            { key: 'cashier', label: '收银区域' },
            { key: 'bakery', label: '烘焙区' },
            { key: 'frozen', label: '冻品区' },
            { key: 'logistics', label: '后勤区' }
        ]
    });

    const [areaDetails, setAreaDetails] = useState<Areas>(INITIAL_AREAS);

    const [employees, setEmployees] = useState<EmployeeConfig>({});
    const [isEmployeesLoaded, setIsEmployeesLoaded] = useState<boolean>(false);
    
    // Auth State
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    
    // UI State
    const [view, setView] = useState<ViewState>('inspector-info');
    // New state to track where we came from (to handle "Back" button correctly)
    const [previousView, setPreviousView] = useState<ViewState>('area-selection');

    const [currentAreaKey, setCurrentAreaKey] = useState<string>('');
    const [currentEmployee, setCurrentEmployee] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // For Area Selection View
    const [selectionAreaKey, setSelectionAreaKey] = useState<string>('');
    const [selectionEmployee, setSelectionEmployee] = useState<string>('');

    // For Management View
    const [manageTab, setManageTab] = useState<'stores' | 'areas' | 'employees' | 'content'>('employees');
    const [manageStore, setManageStore] = useState<string>('龙城店');
    const [manageAreaKey, setManageAreaKey] = useState<string>('vegetables');
    const [contentAreaKey, setContentAreaKey] = useState<string>('vegetables');
    const [newItemName, setNewItemName] = useState<string>(''); // For adding stores/areas/employees

    // Month Selection
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    // Connection Status
    const [syncStatus, setSyncStatus] = useState<'connecting' | 'connected' | 'error' | 'slow'>('connecting');
    // Ref to track if we actually got data
    const hasReceivedData = useRef(false);

    // Initialize Date
    useEffect(() => {
        const now = new Date();
        const formattedDate = now.getFullYear() + '-' + 
                             String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(now.getDate()).padStart(2, '0') + ' ' + 
                             String(now.getHours()).padStart(2, '0') + ':' + 
                             String(now.getMinutes()).padStart(2, '0');
        
        setInspectionData(prev => ({ ...prev, date: formattedDate }));
    }, []);

    // ** CONNECTION WATCHDOG **
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!hasReceivedData.current) {
                setSyncStatus('slow');
                console.warn("Connection is taking longer than expected. Please check if Firestore Database is created and Rules are open.");
            }
        }, 5000); // Alert if nothing happens in 5 seconds
        return () => clearTimeout(timer);
    }, []);

    // ** LOAD APP CONFIG (Priority 0) **
    useEffect(() => {
        const docRef = doc(db, "config", "app");
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as AppConfig;
                
                // Check for missing new areas
                const existingKeys = new Set(data.areas.map(a => a.key));
                const newAreasToAdd = [
                    { key: 'bakery', label: '烘焙区' },
                    { key: 'frozen', label: '冻品区' },
                    { key: 'logistics', label: '后勤区' }
                ].filter(a => !existingKeys.has(a.key));
                
                if (newAreasToAdd.length > 0) {
                    const updatedAreas = [...data.areas, ...newAreasToAdd];
                    updateDoc(docRef, { areas: updatedAreas });
                }

                setAppConfig(prev => ({
                    stores: data.stores || prev.stores,
                    areas: data.areas || prev.areas
                }));
            } else {
                // Initialize if not exists
                setDoc(docRef, appConfig);
            }
        });
        return () => unsubscribe();
    }, []);

    // ** LOAD AREA DETAILS **
    useEffect(() => {
        const docRef = doc(db, "config", "area_details");
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as Areas;
                setAreaDetails(data);
                // Update inspectionData with new structure if we haven't started editing
                // Or just update the structure but keep values? 
                // For simplicity, we update the template.
                // Note: This might reset form if it happens during editing.
                // But since it's onSnapshot, it should be fine as it's mainly for initial load or remote updates.
                setInspectionData(prev => ({
                    ...prev,
                    areas: JSON.parse(JSON.stringify(data))
                }));
            } else {
                // Initialize with INITIAL_AREAS if not exists
                setDoc(docRef, INITIAL_AREAS);
                setAreaDetails(INITIAL_AREAS);
            }
        });
        return () => unsubscribe();
    }, []);

    // ** LOAD EMPLOYEES (Priority 1) **
    useEffect(() => {
        const docRef = doc(db, "config", "employees");
        
        const unsubscribe = onSnapshot(docRef, async (docSnap) => {
            hasReceivedData.current = true;
            setSyncStatus('connected');
            setIsEmployeesLoaded(true);

            if (docSnap.exists()) {
                const cloudData = docSnap.data();
                
                // MIGRATION CHECK: Check if data is in old format (flat keys like 'vegetables')
                // or new format (keys are store names like '龙城店')
                // We assume if it has 'vegetables' at top level, it's old format.
                if (cloudData['vegetables'] && Array.isArray(cloudData['vegetables'])) {
                    console.log("Migrating old employee data to '龙城店'...");
                    const newStructure: EmployeeConfig = {
                        '龙城店': cloudData as any
                    };
                    // Update cloud
                    await setDoc(docRef, newStructure);
                    // Local state update will happen on next snapshot
                } else {
                    setEmployees(cloudData as EmployeeConfig);
                }
            } else {
                console.log("No employee config in cloud.");
                setEmployees({});
            }
        }, (error) => {
            console.error("Sync Error (Employees):", error);
            setSyncStatus('error');
        });

        return () => unsubscribe();
    }, []);

    // ** LOAD RECORDS (Priority 2) **
    useEffect(() => {
        setIsLoading(true);
        // FIXED: Removed orderBy("timestamp", "asc") to prevent "Missing Index" error.
        // We will sort the data in the client (JavaScript) instead.
        const q = query(
            collection(db, "inspections"),
            where("monthStr", "==", selectedMonth)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            hasReceivedData.current = true;
            if(syncStatus !== 'error') setSyncStatus('connected');
            
            const fetchedRecords: InspectionRecord[] = [];
            querySnapshot.forEach((doc) => {
                fetchedRecords.push({ ...doc.data(), id: doc.id } as InspectionRecord);
            });
            
            // Client-side sorting (Oldest to Newest, consistent with previous orderBy)
            fetchedRecords.sort((a, b) => {
                return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            });
            
            setInspectionData(prev => ({ ...prev, records: fetchedRecords }));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching records: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [selectedMonth]);

    // --- Actions ---
    
    const handleStartInspection = (inspector: string, shop: string) => {
        if (!inspector || !shop) {
            alert('请填写检查人姓名和门店名称');
            return;
        }
        setInspectionData(prev => ({ ...prev, inspector, shop }));
        setView('area-selection');
    };

    const handleEnterInspection = () => {
        if (!selectionAreaKey) {
            alert("请选择一个区域");
            return;
        }
        if (!selectionEmployee) {
            alert("请选择该区域的员工");
            return;
        }
        setCurrentAreaKey(selectionAreaKey);
        setCurrentEmployee(selectionEmployee);
        
        setInspectionData(prev => {
            const newAreas = { ...prev.areas };
            // Use areaDetails for fresh copy, fallback to INITIAL_AREAS if not loaded yet
            const sourceArea = areaDetails[selectionAreaKey] || INITIAL_AREAS[selectionAreaKey];
            const freshArea = JSON.parse(JSON.stringify(sourceArea));
            
            freshArea.employee = selectionEmployee;
            newAreas[selectionAreaKey] = freshArea;
            return { ...prev, areas: newAreas };
        });
        setSearchTerm('');
        setView('inspection');
    };

    // Updated: Go to results via specific entry point logic
    const handleViewResults = (from: ViewState) => {
        setPreviousView(from);
        setView('results');
    };

    // Updated: Generic Back button
    const handleBack = () => {
        if (view === 'results') {
            setView(previousView); // Return to Management or Area Selection
        } else if (view === 'inspection') {
            setView('area-selection');
        } else {
            setView('area-selection');
        }
    };

    const handleBackToAreas = () => {
        setSelectionAreaKey('');
        setSelectionEmployee('');
        setView('area-selection');
    };

    const handleUpdateScore = (itemIndex: number, standardIndex: number, newScore: number) => {
        setInspectionData(prev => {
            const newAreas = { ...prev.areas };
            const newArea = { ...newAreas[currentAreaKey] };
            newArea.items = newArea.items.map((item, idx) => {
                if (idx !== itemIndex) return item;
                return {
                    ...item,
                    standards: item.standards.map((std, sIdx) => {
                        if (sIdx !== standardIndex) return std;
                        return { ...std, score: newScore };
                    })
                };
            });
            newAreas[currentAreaKey] = newArea;
            return { ...prev, areas: newAreas };
        });
    };

    const handleConfirmInspection = async () => {
        if (!currentAreaKey) return;
        const currentArea = inspectionData.areas[currentAreaKey];
        if (!currentArea) return;

        let totalScore = 0;
        let maxScore = 0;
        const deductions: Deduction[] = [];

        currentArea.items.forEach(item => {
            item.standards.forEach(standard => {
                totalScore += standard.score;
                maxScore += standard.maxScore;
                if (standard.score < standard.maxScore) {
                    deductions.push({
                        item: item.name,
                        standard: standard.name,
                        score: standard.score,
                        maxScore: standard.maxScore,
                        criteria: standard.criteria
                    });
                }
            });
        });

        const recordToSave: Omit<InspectionRecord, 'id'> = {
            ...currentArea,
            score: totalScore,
            maxScore: maxScore,
            completed: true,
            deductions: deductions,
            employee: currentEmployee,
            areaKey: currentAreaKey,
            timestamp: new Date().toISOString(),
            monthStr: selectedMonth,
            inspector: inspectionData.inspector, // Save current inspector to record
            shop: inspectionData.shop // Save current shop
        };

        setIsSubmitting(true);

        addDoc(collection(db, "inspections"), recordToSave)
            .then(() => { console.log("Sync success"); })
            .catch((e) => {
                console.error("Sync Error: ", e);
                alert("⚠️ 提交失败！权限不足或网络断开。\n" + e.message);
                setIsSubmitting(false);
                return;
            });

        setTimeout(() => {
            setIsSubmitting(false);
            alert("提交成功！(Syncing in background)");
            handleBackToAreas();
        }, 300); 
    };

    const handleCancelInspection = () => {
         if (window.confirm('确定要取消当前检查吗？未保存的评分将丢失。')) {
            handleBackToAreas();
        }
    };
    
    // Management Actions
    
    // --- Store Management ---
    const handleAddStore = async () => {
        const name = newItemName.trim();
        if (!name) return;
        if (appConfig.stores.includes(name)) {
            alert("门店已存在");
            return;
        }
        const docRef = doc(db, "config", "app");
        try {
            await updateDoc(docRef, { stores: arrayUnion(name) });
            setNewItemName('');
        } catch (e: any) {
            alert("保存失败: " + e.message);
        }
    };

    const handleDeleteStore = async (name: string) => {
        if (name === '龙城店') {
            alert("默认门店无法删除");
            return;
        }
        if (window.confirm(`确定要删除门店 ${name} 吗？`)) {
            const docRef = doc(db, "config", "app");
            try {
                await updateDoc(docRef, { stores: arrayRemove(name) });
            } catch (e: any) {
                alert("删除失败: " + e.message);
            }
        }
    };

    // --- Area Management ---
    const handleAddArea = async () => {
        const label = newItemName.trim();
        if (!label) return;
        
        // Simple key generation: use label as key for simplicity in this version
        const key = label; 
        
        if (appConfig.areas.some(a => a.key === key)) {
            alert("区域已存在");
            return;
        }

        const newArea = { key, label };
        const docRef = doc(db, "config", "app");
        try {
            await updateDoc(docRef, { areas: arrayUnion(newArea) });
            setNewItemName('');
        } catch (e: any) {
             alert("保存失败: " + e.message);
        }
    };

    const handleDeleteArea = async (area: {key: string, label: string}) => {
        if (window.confirm(`确定要删除区域 ${area.label} 吗？`)) {
            const docRef = doc(db, "config", "app");
            try {
                await updateDoc(docRef, { areas: arrayRemove(area) });
            } catch (e: any) {
                alert("删除失败: " + e.message);
            }
        }
    };

    // --- Employee Management ---
    const handleAddEmployee = async () => {
        const name = newItemName.trim();
        if (!name) return;
        
        const docRef = doc(db, "config", "employees");
        const fieldPath = `${manageStore}.${manageAreaKey}`;
        
        try {
            await updateDoc(docRef, { [fieldPath]: arrayUnion(name) });
            setNewItemName(''); 
        } catch (e: any) {
            console.log("Update failed, trying setDoc merge...", e);
            try {
                const snap = await getDoc(docRef);
                const data = snap.exists() ? snap.data() as EmployeeConfig : {};
                
                if (!data[manageStore]) data[manageStore] = {};
                if (!data[manageStore][manageAreaKey]) data[manageStore][manageAreaKey] = [];
                
                if (!data[manageStore][manageAreaKey].includes(name)) {
                    data[manageStore][manageAreaKey].push(name);
                    await setDoc(docRef, data);
                }
                setNewItemName('');
            } catch (err: any) {
                alert("保存失败: " + err.message);
            }
        }
    };

    const handleDeleteEmployee = async (nameToDelete: string) => {
        if (window.confirm(`确定要删除员工 ${nameToDelete} 吗？`)) {
            const docRef = doc(db, "config", "employees");
            const fieldPath = `${manageStore}.${manageAreaKey}`;
            try {
                await updateDoc(docRef, { [fieldPath]: arrayRemove(nameToDelete) });
            } catch (e: any) {
                try {
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data() as EmployeeConfig;
                        if (data[manageStore] && data[manageStore][manageAreaKey]) {
                            data[manageStore][manageAreaKey] = data[manageStore][manageAreaKey].filter(n => n !== nameToDelete);
                            await setDoc(docRef, data);
                        }
                    }
                } catch (err: any) {
                    alert("删除失败: " + err.message);
                }
            }
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        // PERMISSION CHECK
        if (!isAdmin) {
            const password = window.prompt("⚠️ 权限验证\n\n删除历史记录需要管理员权限，请输入密码:");
            if (password === 'admin888') {
                setIsAdmin(true); // Grant admin privileges for this session
            } else {
                if (password !== null) alert("❌ 密码错误，权限不足，无法删除！");
                return;
            }
        }

        if(window.confirm("确定要永久删除这条云端检查记录吗？此操作无法撤销。")) {
            try { await deleteDoc(doc(db, "inspections", recordId)); } 
            catch (e) { alert("删除失败"); }
        }
    };

    const handleAccessManagement = () => {
        if (isAdmin) {
            setView('management');
            return;
        }
        const password = window.prompt("请输入管理员密码:");
        if (password === 'admin888') {
            setIsAdmin(true);
            setView('management');
        }
        else if (password !== null) alert("密码错误！");
    };

    // --- Renderers ---

    const renderInspectorInfo = () => (
        <div id="inspector-info-page">
            <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px] relative flex justify-center items-center">
                <h1 className="text-center text-2xl font-bold">商超门店巡检</h1>
                
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-xs" 
                     title={syncStatus === 'connected' ? "云端已连接" : "检查Firebase数据库设置"}>
                    <div className={`w-2 h-2 rounded-full ${
                        syncStatus === 'connected' ? 'bg-green-400' : 
                        syncStatus === 'error' ? 'bg-red-500' : 
                        syncStatus === 'slow' ? 'bg-orange-400' : 'bg-yellow-400 animate-pulse'
                    }`}></div>
                    <span>
                        {syncStatus === 'connected' ? '已同步' : 
                         syncStatus === 'error' ? '连接失败' : 
                         syncStatus === 'slow' ? '连接缓慢' : '连接中...'}
                    </span>
                </div>

                <button 
                    onClick={handleAccessManagement}
                    className="absolute right-4 bg-white/10 hover:bg-white text-white hover:text-[#3498db] border border-white/40 px-3 py-1.5 rounded shadow-sm text-sm transition-all duration-200 flex items-center gap-1 backdrop-blur-sm"
                    disabled={!isEmployeesLoaded && syncStatus !== 'connected'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.157.945c.03.18.158.322.336.37.587.159 1.144.398 1.663.708.163.097.362.073.498-.06l.732-.71c.408-.396 1.05-.407 1.465-.02l.772.716c.42.389.467 1.033.106 1.47l-.54.654c-.118.143-.133.344-.04.512.277.514.475 1.057.586 1.628.035.18.175.31.358.323l.913.063c.556.038.99.492.99 1.048v1.074c0 .556-.434 1.01-.99 1.048l-.913.063c-.183.013-.323.143-.358.323a8.18 8.18 0 01-.586 1.628c-.093.168-.078.37.04.512l.54.654c.36.437.314 1.08-.106 1.47l-.772.716c-.415.387-1.057.376-1.465-.02l-.732-.71c-.136-.132-.335-.157-.498-.06a8.154 8.154 0 01-1.663.708c-.178.048-.306.19-.336.37l-.157.945z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    管理后台
                </button>
            </div>

            <div className="mb-[20px] bg-yellow-50 p-4 rounded border border-yellow-200">
                <label className="block mb-[5px] font-bold text-gray-700">当前考评月份 (Month):</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded font-bold text-lg"
                    />
                    <span className="text-sm text-gray-500">
                        * 切换月份可查询历史汇总，所有提交将计入该月。
                    </span>
                </div>
            </div>

            <div className="mb-[15px]">
                <label className="block mb-[5px] font-bold">检查人姓名 (Inspector Name):</label>
                <input 
                    type="text" 
                    className="w-full p-[8px] border border-[#ddd] rounded-[4px] box-border"
                    value={inspectionData.inspector}
                    onChange={(e) => setInspectionData(prev => ({...prev, inspector: e.target.value}))}
                    required 
                />
            </div>
            <div className="mb-[15px]">
                <label className="block mb-[5px] font-bold">门店名称 (Shop Name):</label>
                <select 
                    className="w-full p-[8px] border border-[#ddd] rounded-[4px] box-border bg-white"
                    value={inspectionData.shop}
                    onChange={(e) => setInspectionData(prev => ({...prev, shop: e.target.value}))}
                    required 
                >
                    {appConfig.stores.map(store => (
                        <option key={store} value={store}>{store}</option>
                    ))}
                </select>
            </div>
            <button 
                type="button"
                className="bg-[#27ae60] text-white border-none py-[10px] px-[15px] rounded-[4px] cursor-pointer text-[16px] m-[5px] hover:bg-[#219653] transition-colors duration-300 w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => handleStartInspection(inspectionData.inspector, inspectionData.shop)}
                disabled={!isEmployeesLoaded && syncStatus !== 'connected'}
            >
                {(!isEmployeesLoaded && syncStatus !== 'connected') ? 
                    (syncStatus === 'slow' ? '连接缓慢，请检查后台设置' : '正在连接云端...') : 
                    '开始检查'}
            </button>
        </div>
    );

    const renderManagement = () => (
        <div id="management-page">
            <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px] flex justify-between items-center">
                <h2 className="text-xl font-bold">后台管理 (Management)</h2>
                <button onClick={() => setView('inspector-info')} className="bg-transparent border border-white text-white px-3 py-1 rounded hover:bg-white hover:text-[#3498db]">
                    返回首页
                </button>
            </div>

            {/* NEW: Report Management Section */}
            <div className="bg-white p-4 rounded border mb-6 shadow-sm border-l-4 border-l-[#27ae60]">
                <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    数据报表管理
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-3 rounded">
                    <div className="flex items-center gap-2">
                        <label className="font-bold text-gray-700">选择查看月份:</label>
                        <input 
                            type="month" 
                            value={selectedMonth} 
                            onChange={(e) => setSelectedMonth(e.target.value)} 
                            className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3498db] outline-none" 
                        />
                    </div>
                    <div className="text-sm text-gray-500">
                        当前选中: {selectedMonth} (共 {inspectionData.records.length} 条记录)
                    </div>
                    <button 
                        onClick={() => handleViewResults('management')} 
                        className="bg-[#27ae60] hover:bg-[#219653] text-white px-6 py-2 rounded font-bold shadow transition-colors ml-auto"
                    >
                        查看报表 & 导出 Excel
                    </button>
                </div>
            </div>

            {/* Configuration Management Tabs */}
            <div className="bg-white p-4 rounded border shadow-sm">
                <div className="flex border-b mb-4">
                    <button 
                        className={`px-4 py-2 font-bold ${manageTab === 'employees' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
                        onClick={() => setManageTab('employees')}
                    >
                        人员管理 (Employees)
                    </button>
                    <button 
                        className={`px-4 py-2 font-bold ${manageTab === 'stores' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
                        onClick={() => setManageTab('stores')}
                    >
                        门店管理 (Stores)
                    </button>
                    <button 
                        className={`px-4 py-2 font-bold ${manageTab === 'areas' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
                        onClick={() => setManageTab('areas')}
                    >
                        区域管理 (Areas)
                    </button>
                    <button 
                        className={`px-4 py-2 font-bold ${manageTab === 'content' ? 'text-[#3498db] border-b-2 border-[#3498db]' : 'text-gray-500'}`}
                        onClick={() => setManageTab('content')}
                    >
                        检查内容 (Content)
                    </button>
                </div>

                {manageTab === 'employees' && (
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded border space-y-4">
                            <div>
                                <label className="block font-bold mb-1">1. 选择门店</label>
                                <select className="w-full p-2 border rounded" value={manageStore} onChange={(e) => setManageStore(e.target.value)}>
                                    {appConfig.stores.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-1">2. 选择区域</label>
                                <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                                    {appConfig.areas.map(area => (
                                        <button 
                                            key={area.key} 
                                            onClick={() => setManageAreaKey(area.key)} 
                                            className={`text-left p-2 rounded text-sm ${manageAreaKey === area.key ? 'bg-[#3498db] text-white' : 'bg-white hover:bg-gray-100 border'}`}
                                        >
                                            {area.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-2/3 bg-white p-4 rounded border">
                            <h3 className="font-bold mb-3">管理 {manageStore} - {appConfig.areas.find(a => a.key === manageAreaKey)?.label} 员工</h3>
                            <div className="flex gap-2 mb-4">
                                <input type="text" className="flex-1 p-2 border rounded" placeholder="输入员工姓名" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                                <button onClick={handleAddEmployee} className="bg-[#27ae60] text-white px-4 py-2 rounded hover:bg-[#219653]">添加</button>
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                {(!employees[manageStore] || !employees[manageStore][manageAreaKey] || employees[manageStore][manageAreaKey].length === 0) && <p className="text-gray-400 italic">暂无员工 (请添加)</p>}
                                {employees[manageStore]?.[manageAreaKey]?.map((name, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                        <span>{name}</span>
                                        <button onClick={() => handleDeleteEmployee(name)} className="text-red-500 hover:text-red-700 font-bold">删除</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {manageTab === 'stores' && (
                    <div className="p-4">
                        <h3 className="font-bold mb-3">门店列表</h3>
                        <div className="flex gap-2 mb-4">
                            <input type="text" className="flex-1 p-2 border rounded" placeholder="输入新门店名称" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                            <button onClick={handleAddStore} className="bg-[#27ae60] text-white px-4 py-2 rounded hover:bg-[#219653]">添加门店</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {appConfig.stores.map((store, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <span className="font-bold">{store}</span>
                                    {store !== '龙城店' && (
                                        <button onClick={() => handleDeleteStore(store)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {manageTab === 'areas' && (
                    <div className="p-4">
                        <h3 className="font-bold mb-3">区域列表 (全局配置)</h3>
                        <div className="flex gap-2 mb-4">
                            <input type="text" className="flex-1 p-2 border rounded" placeholder="输入新区域名称" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                            <button onClick={handleAddArea} className="bg-[#27ae60] text-white px-4 py-2 rounded hover:bg-[#219653]">添加区域</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {appConfig.areas.map((area, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                    <div>
                                        <div className="font-bold">{area.label}</div>
                                        <div className="text-xs text-gray-400">Key: {area.key}</div>
                                    </div>
                                    <button onClick={() => handleDeleteArea(area)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-4">* 注意: 新增区域默认使用通用检查标准，如需定制标准请联系管理员。</p>
                    </div>
                )}

                {manageTab === 'content' && (
                    <div className="p-4">
                        <div className="bg-gray-50 p-4 rounded border mb-6">
                            <label className="block font-bold mb-2">选择要编辑的区域 (Select Area to Edit)</label>
                            <select 
                                className="w-full p-2 border rounded" 
                                value={contentAreaKey} 
                                onChange={(e) => setContentAreaKey(e.target.value)}
                            >
                                {appConfig.areas.map(area => (
                                    <option key={area.key} value={area.key}>{area.label}</option>
                                ))}
                            </select>
                        </div>

                        {areaDetails[contentAreaKey] && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-2">
                                    <h3 className="font-bold text-lg">{areaDetails[contentAreaKey].name} - 检查项列表</h3>
                                    <button 
                                        onClick={() => {
                                            const newItem = { name: "新检查项 (New Item)", standards: [] };
                                            const updatedArea = { ...areaDetails[contentAreaKey], items: [...areaDetails[contentAreaKey].items, newItem] };
                                            const updatedDetails = { ...areaDetails, [contentAreaKey]: updatedArea };
                                            setAreaDetails(updatedDetails);
                                            setDoc(doc(db, "config", "area_details"), updatedDetails);
                                        }}
                                        className="bg-[#27ae60] text-white px-3 py-1 rounded text-sm hover:bg-[#219653]"
                                    >
                                        + 添加检查项
                                    </button>
                                </div>

                                {areaDetails[contentAreaKey].items.map((item: Item, itemIdx: number) => (
                                    <div key={itemIdx} className="border rounded p-4 bg-white shadow-sm">
                                        <div className="flex justify-between items-center mb-3 border-b pb-2">
                                            <input 
                                                className="font-bold text-lg border-b border-dashed border-gray-300 focus:border-[#3498db] outline-none w-full mr-4 bg-transparent"
                                                value={item.name}
                                                onChange={(e) => {
                                                    const newItems = [...areaDetails[contentAreaKey].items];
                                                    newItems[itemIdx] = { ...newItems[itemIdx], name: e.target.value };
                                                    const updatedDetails = { ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } };
                                                    setAreaDetails(updatedDetails);
                                                }}
                                                onBlur={() => setDoc(doc(db, "config", "area_details"), areaDetails)}
                                            />
                                            <button 
                                                onClick={() => {
                                                    if(!confirm('确定删除此检查项吗？')) return;
                                                    const newItems = areaDetails[contentAreaKey].items.filter((_, i) => i !== itemIdx);
                                                    const updatedDetails = { ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } };
                                                    setAreaDetails(updatedDetails);
                                                    setDoc(doc(db, "config", "area_details"), updatedDetails);
                                                }}
                                                className="text-red-500 hover:text-red-700 text-sm whitespace-nowrap px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                            >
                                                删除项
                                            </button>
                                        </div>

                                        <div className="space-y-3 pl-2 md:pl-4">
                                            {item.standards.map((std: Standard, stdIdx: number) => (
                                                <div key={stdIdx} className="flex flex-col gap-2 p-3 bg-gray-50 rounded border border-gray-100 relative group hover:border-blue-200 transition-colors">
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-xs text-gray-400 w-6">#{stdIdx + 1}</span>
                                                        <input 
                                                            className="flex-1 border p-1 rounded text-sm focus:ring-1 focus:ring-blue-300 outline-none" 
                                                            value={std.name} 
                                                            placeholder="标准名称"
                                                            onChange={(e) => {
                                                                const newItems = [...areaDetails[contentAreaKey].items];
                                                                const newStandards = [...newItems[itemIdx].standards];
                                                                newStandards[stdIdx] = { ...newStandards[stdIdx], name: e.target.value };
                                                                newItems[itemIdx] = { ...newItems[itemIdx], standards: newStandards };
                                                                setAreaDetails({ ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } });
                                                            }}
                                                            onBlur={() => setDoc(doc(db, "config", "area_details"), areaDetails)}
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-gray-500">分值:</span>
                                                            <input 
                                                                className="w-12 border p-1 rounded text-sm text-center focus:ring-1 focus:ring-blue-300 outline-none" 
                                                                type="number" 
                                                                value={std.score} 
                                                                placeholder="分"
                                                                onChange={(e) => {
                                                                    const val = Number(e.target.value);
                                                                    const newItems = [...areaDetails[contentAreaKey].items];
                                                                    const newStandards = [...newItems[itemIdx].standards];
                                                                    newStandards[stdIdx] = { ...newStandards[stdIdx], score: val, maxScore: val };
                                                                    newItems[itemIdx] = { ...newItems[itemIdx], standards: newStandards };
                                                                    setAreaDetails({ ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } });
                                                                }}
                                                                onBlur={() => setDoc(doc(db, "config", "area_details"), areaDetails)}
                                                            />
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                const newItems = [...areaDetails[contentAreaKey].items];
                                                                const newStandards = newItems[itemIdx].standards.filter((_, i) => i !== stdIdx);
                                                                newItems[itemIdx] = { ...newItems[itemIdx], standards: newStandards };
                                                                const updatedDetails = { ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } };
                                                                setAreaDetails(updatedDetails);
                                                                setDoc(doc(db, "config", "area_details"), updatedDetails);
                                                            }}
                                                            className="text-red-400 hover:text-red-600 font-bold px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="删除标准"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <textarea 
                                                        className="w-full border p-2 rounded text-xs text-gray-600 h-16 focus:ring-1 focus:ring-blue-300 outline-none resize-y"
                                                        value={std.criteria}
                                                        placeholder="扣分标准描述..."
                                                        onChange={(e) => {
                                                            const newItems = [...areaDetails[contentAreaKey].items];
                                                            const newStandards = [...newItems[itemIdx].standards];
                                                            newStandards[stdIdx] = { ...newStandards[stdIdx], criteria: e.target.value };
                                                            newItems[itemIdx] = { ...newItems[itemIdx], standards: newStandards };
                                                            setAreaDetails({ ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } });
                                                        }}
                                                        onBlur={() => setDoc(doc(db, "config", "area_details"), areaDetails)}
                                                    />
                                                </div>
                                            ))}
                                            <button 
                                                onClick={() => {
                                                    const newItems = [...areaDetails[contentAreaKey].items];
                                                    const newStandard = { name: "新标准", score: 2, maxScore: 2, criteria: "扣分标准..." };
                                                    newItems[itemIdx] = { ...newItems[itemIdx], standards: [...newItems[itemIdx].standards, newStandard] };
                                                    const updatedDetails = { ...areaDetails, [contentAreaKey]: { ...areaDetails[contentAreaKey], items: newItems } };
                                                    setAreaDetails(updatedDetails);
                                                    setDoc(doc(db, "config", "area_details"), updatedDetails);
                                                }}
                                                className="text-[#3498db] text-sm hover:underline mt-2 flex items-center gap-1"
                                            >
                                                <span>+ 添加标准</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderAreaSelection = () => {
        const areaOptions = appConfig.areas;
        return (
            <div id="area-selection-page">
                <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px] relative">
                    {/* ADDED: Back to Home Button */}
                    <button 
                        onClick={() => setView('inspector-info')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm transition-colors border border-white/20"
                    >
                        &lt; 返回首页
                    </button>
                    
                    <h2 className="text-center text-xl font-bold">检查区域选择</h2>
                    <p className="text-center mt-2 font-mono text-sm">
                        门店: {inspectionData.shop} | 月份: {selectedMonth}
                    </p>
                </div>
                
                <div className="max-w-md mx-auto bg-white p-6 rounded shadow-sm border border-gray-200">
                    <div className="mb-4">
                        <label className="block mb-2 font-bold text-gray-700">1. 选择区域 (Select Area)</label>
                        <select className="w-full p-3 border border-gray-300 rounded bg-white" value={selectionAreaKey} onChange={(e) => { setSelectionAreaKey(e.target.value); setSelectionEmployee(''); }}>
                            <option value="">-- 请选择 --</option>
                            {areaOptions.map(opt => {
                                const count = inspectionData.records.filter(r => r.areaKey === opt.key && (r.shop === inspectionData.shop || (!r.shop && inspectionData.shop === '龙城店'))).length;
                                return (<option key={opt.key} value={opt.key}>{opt.label} {count > 0 ? `(本月已检: ${count}次)` : ''}</option>);
                            })}
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 font-bold text-gray-700">2. 选择员工 (Select Employee)</label>
                        <select className="w-full p-3 border border-gray-300 rounded bg-white" value={selectionEmployee} onChange={(e) => setSelectionEmployee(e.target.value)} disabled={!selectionAreaKey}>
                            <option value="">-- 请选择 --</option>
                            {selectionAreaKey && employees[inspectionData.shop]?.[selectionAreaKey]?.map((name, idx) => (<option key={idx} value={name}>{name}</option>))}
                        </select>
                        {!isEmployeesLoaded && <p className="text-xs text-red-500 mt-1">正在等待员工名单同步...</p>}
                        {isEmployeesLoaded && selectionAreaKey && (!employees[inspectionData.shop]?.[selectionAreaKey] || employees[inspectionData.shop]?.[selectionAreaKey].length === 0) && 
                            <p className="text-xs text-orange-500 mt-1">该区域暂无员工，请联系管理员添加。</p>
                        }
                    </div>
                    <button type="button" disabled={!selectionAreaKey || !selectionEmployee} className={`w-full py-3 px-4 rounded font-bold text-white transition-colors duration-300 ${(!selectionAreaKey || !selectionEmployee) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#27ae60] hover:bg-[#219653] cursor-pointer'}`} onClick={handleEnterInspection}>
                        开始检查 (Start Inspection)
                    </button>
                </div>
                <div className="mt-8 border-t pt-6 pb-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">{selectedMonth} 月份检查记录 ({inspectionData.records.filter(r => r.shop === inspectionData.shop || (!r.shop && inspectionData.shop === '龙城店')).length})</h3>
                    {isLoading ? (<p className="text-center text-gray-500">正在从云端同步数据...</p>) : inspectionData.records.filter(r => r.shop === inspectionData.shop || (!r.shop && inspectionData.shop === '龙城店')).length === 0 ? (<p className="text-center text-gray-400">该门店本月暂无检查记录</p>) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...inspectionData.records].filter(r => r.shop === inspectionData.shop || (!r.shop && inspectionData.shop === '龙城店')).reverse().map((record) => (
                                <div key={record.id} className="p-4 rounded border bg-green-50 border-green-200 relative">
                                    <div className="font-bold">{record.name}</div>
                                    <div className="text-sm mt-1 text-gray-600">员工: <strong className="text-blue-600">{record.employee}</strong></div>
                                    <div className="text-sm mt-1">得分: {record.score} / {record.maxScore}</div>
                                    <div className="text-xs text-gray-400 mt-2">{new Date(record.timestamp).toLocaleString()}</div>
                                    <button onClick={() => handleDeleteRecord(record.id)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">删除</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderInspectionPage = () => {
        const area = inspectionData.areas[currentAreaKey];
        if (!area) return null;
        return (
            <div id="inspection-page">
                <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px]">
                    <h2 className="text-center text-xl font-bold">{area.name}</h2>
                    <p className="text-center mt-2">月份: <span className="font-bold">{selectedMonth}</span> | 被检员工: <span className="font-bold underline text-yellow-300">{currentEmployee}</span></p>
                </div>
                <div className="my-[20px] flex justify-between items-center">
                    <div><input type="text" placeholder="搜索项目..." className="w-[200px] p-[8px] border rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <button onClick={handleBackToAreas} className="bg-[#7f8c8d] text-white px-4 py-2 rounded">返回</button>
                </div>
                <div id="inspection-items-container">
                    {area.items.map((item, itemIdx) => {
                        if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return null;
                        return (
                            <div key={itemIdx} className="bg-[#f9f9f9] border border-[#ddd] rounded-[5px] p-[15px] mb-[15px]">
                                <h3 className="text-[#2c3e50] text-lg font-bold mb-2 text-center">{item.name}</h3>
                                {item.standards.map((standard, stdIdx) => (
                                    <div key={stdIdx} className="ml-[20px] mb-[10px] p-[10px] bg-[#ecf0f1] rounded-[4px]">
                                        <p className="font-bold mb-[5px]">{standard.name}</p>
                                        <p className="text-[14px] text-gray-500">标准: {standard.criteria}</p>
                                        <div className="flex items-center mt-[5px]">
                                            <select className="w-[80px] mr-[10px] p-[8px] border border-[#ddd] rounded-[4px]" value={standard.score} onChange={(e) => handleUpdateScore(itemIdx, stdIdx, parseInt(e.target.value))}>
                                                {Array.from({ length: standard.maxScore + 1 }, (_, i) => standard.maxScore - i).map(score => (<option key={score} value={score}>{score}分</option>))}
                                            </select>
                                            <span> / {standard.maxScore}分</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-[20px] pb-10">
                    <button onClick={handleConfirmInspection} disabled={isSubmitting} className={`bg-[#27ae60] text-white py-[10px] px-[20px] rounded-[4px] mr-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>{isSubmitting ? '提交中...' : '提交'}</button>
                    <button onClick={handleCancelInspection} className="bg-[#7f8c8d] text-white py-[10px] px-[20px] rounded-[4px]">取消</button>
                </div>
            </div>
        );
    };

    const renderResultsPage = () => {
        // Filter records by current shop
        const shopRecords = inspectionData.records.filter(r => r.shop === inspectionData.shop || (!r.shop && inspectionData.shop === '龙城店'));

        type AggregatedItem = { name?: string; areaKey: string; employee: string; totalScore: number; maxScore: number; count: number; deductions: Deduction[]; };
        const aggregatedData = shopRecords.reduce<Record<string, AggregatedItem>>((acc, record) => {
            const key = `${record.areaKey}_${record.employee}`;
            if (!acc[key]) acc[key] = { name: record.name, areaKey: record.areaKey, employee: record.employee || 'Unknown', totalScore: 0, maxScore: record.maxScore, count: 0, deductions: [] };
            acc[key].totalScore += record.score;
            acc[key].count += 1;
            acc[key].deductions.push(...record.deductions);
            return acc;
        }, {});
        const results = Object.values(aggregatedData).map((item: AggregatedItem) => ({ ...item, avgScore: Number((item.totalScore / item.count).toFixed(1)) }));
        const totalAvgScoreSum = results.reduce((sum, item) => sum + item.avgScore, 0);
        const totalMaxScoreSum = results.reduce((sum, item) => sum + item.maxScore, 0);
        const displayTotalScore = totalAvgScoreSum.toFixed(1);
        const overallPercentage = totalMaxScoreSum > 0 ? (totalAvgScoreSum / totalMaxScoreSum * 100).toFixed(1) : '0';

        return (
            <div id="results-page">
                <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px]">
                    <h2 className="text-center text-xl font-bold">{selectedMonth} 月份检查结果汇总</h2>
                    <p className="text-center mt-2">门店: {inspectionData.shop}</p>
                </div>
                
                <div className="flex justify-center items-center mb-6">
                    <label className="mr-2 font-bold">切换月份查看历史:</label>
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="p-2 border rounded" />
                </div>
                
                {shopRecords.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                        <p className="text-gray-500 text-lg">该门店 ({inspectionData.shop}) 在该月份 ({selectedMonth}) 暂无检查记录。</p>
                        <p className="text-sm text-gray-400 mt-2">请切换月份或返回进行新的检查。</p>
                    </div>
                ) : (
                    <>
                        <div className="text-[18px] font-bold my-[20px] text-center">{selectedMonth} 总分 (Sum of Averages): <span>{displayTotalScore}</span> / <span>{totalMaxScoreSum}</span> (<span>{overallPercentage}</span>%)</div>
                        <table className="w-full border-collapse my-[20px]">
                            <thead>
                                <tr>
                                    <th className="border border-[#ddd] p-[8px] bg-[#3498db] text-white">区域</th>
                                    <th className="border border-[#ddd] p-[8px] bg-[#3498db] text-white">员工</th>
                                    <th className="border border-[#ddd] p-[8px] bg-[#3498db] text-white">次数</th>
                                    <th className="border border-[#ddd] p-[8px] bg-[#3498db] text-white">平均分</th>
                                    <th className="border border-[#ddd] p-[8px] bg-[#3498db] text-white">满分</th>
                                    <th className="border border-[#ddd] p-[8px] bg-[#3498db] text-white">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((data, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? "bg-[#f2f2f2]" : ""}>
                                        <td className="border p-[8px]">{data.name}</td>
                                        <td className="border p-[8px] font-bold text-blue-600">{data.employee}</td>
                                        <td className="border p-[8px] text-center">{data.count}</td>
                                        <td className="border p-[8px] font-bold">{data.avgScore}</td>
                                        <td className="border p-[8px]">{data.maxScore}</td>
                                        <td className="border p-[8px]">{(data.maxScore > 0 ? (data.avgScore / data.maxScore * 100).toFixed(1) : '0')}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
                
                <div className="text-center mt-[20px] pb-10">
                    <button onClick={() => exportToExcel(inspectionData)} disabled={shopRecords.length === 0} className={`bg-[#27ae60] text-white px-4 py-2 rounded mr-4 ${shopRecords.length === 0 ? 'bg-gray-400 cursor-not-allowed' : ''}`}>导出本月报表 (Excel)</button>
                    <button onClick={handleBack} className="bg-[#7f8c8d] text-white px-4 py-2 rounded">返回</button>
                </div>
            </div>
        );
    };

    return (
        <div className="container max-w-[1200px] mx-auto bg-white p-[10px] md:p-[20px] rounded-[8px] shadow-[0_0_10px_rgba(0,0,0,0.1)]">
            {view === 'inspector-info' && renderInspectorInfo()}
            {view === 'management' && renderManagement()}
            {view === 'area-selection' && renderAreaSelection()}
            {view === 'inspection' && renderInspectionPage()}
            {view === 'results' && renderResultsPage()}
        </div>
    );
};

export default App;
