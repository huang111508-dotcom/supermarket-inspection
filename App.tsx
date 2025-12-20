
import React, { useState, useEffect } from 'react';
import { InspectionData, ViewState, Deduction, EmployeeConfig, InspectionRecord } from './types';
import { INITIAL_AREAS, INITIAL_EMPLOYEES } from './data';
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
    orderBy, 
    setDoc, 
    updateDoc, 
    arrayUnion, 
    arrayRemove
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
        shop: '',
        date: '',
        areas: JSON.parse(JSON.stringify(INITIAL_AREAS)), // Deep copy to ensure fresh state
        records: [] // Store completed records here
    }));

    const [employees, setEmployees] = useState<EmployeeConfig>(INITIAL_EMPLOYEES);
    
    // UI State
    const [view, setView] = useState<ViewState>('inspector-info');
    const [currentAreaKey, setCurrentAreaKey] = useState<string>('');
    const [currentEmployee, setCurrentEmployee] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // For Area Selection View
    const [selectionAreaKey, setSelectionAreaKey] = useState<string>('');
    const [selectionEmployee, setSelectionEmployee] = useState<string>('');

    // For Management View
    const [manageAreaKey, setManageAreaKey] = useState<string>('vegetables');
    const [newEmployeeName, setNewEmployeeName] = useState<string>('');

    // **NEW**: Month Selection for History/Archiving
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthStr());
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // **NEW**: Submitting state for feedback
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    
    // **NEW**: Connection Status
    const [syncStatus, setSyncStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

    // Initialize Date string for the form
    useEffect(() => {
        const now = new Date();
        const formattedDate = now.getFullYear() + '-' + 
                             String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(now.getDate()).padStart(2, '0') + ' ' + 
                             String(now.getHours()).padStart(2, '0') + ':' + 
                             String(now.getMinutes()).padStart(2, '0');
        
        setInspectionData(prev => ({ ...prev, date: formattedDate }));
    }, []);

    // **NEW**: Load Employees from Cloud using onSnapshot (Real-time Sync) with Atomic Init Check
    useEffect(() => {
        const docRef = doc(db, "config", "employees");
        
        // Listen to the document in real-time
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            setSyncStatus('connected');
            if (docSnap.exists()) {
                console.log("Employees synced from cloud.");
                setEmployees(docSnap.data() as EmployeeConfig);
            } else {
                console.log("No config found in cloud via snapshot. Checking logic...");
                // Only write defaults if we are sure it's empty (handled by a separate check or user action usually, 
                // but for simplicity we init here if missing).
                // Use a transactional style check effectively by just setting it if missing.
                setDoc(docRef, INITIAL_EMPLOYEES).catch(e => {
                    console.error("Failed to initialize config in cloud:", e);
                });
            }
        }, (error) => {
            console.error("Sync Error (Employees):", error);
            setSyncStatus('error');
            if (error.code === 'permission-denied') {
               alert("警告：无法从云端加载员工名单 (Permission Denied)。");
            }
        });

        return () => unsubscribe();
    }, []);

    // **NEW**: Firebase Real-time Listener based on Selected Month
    useEffect(() => {
        setIsLoading(true);
        // Query: Get inspections where monthStr matches selectedMonth
        const q = query(
            collection(db, "inspections"),
            where("monthStr", "==", selectedMonth),
            orderBy("timestamp", "asc") // Optional: order by time
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedRecords: InspectionRecord[] = [];
            querySnapshot.forEach((doc) => {
                fetchedRecords.push({ ...doc.data(), id: doc.id } as InspectionRecord);
            });
            
            // Update local state with cloud data
            setInspectionData(prev => ({
                ...prev,
                records: fetchedRecords
            }));
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching documents: ", error);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount or month change
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
        
        // Update current context
        setCurrentAreaKey(selectionAreaKey);
        setCurrentEmployee(selectionEmployee);
        
        // RESET Logic: Load fresh form
        setInspectionData(prev => {
            const newAreas = { ...prev.areas };
            const freshArea = JSON.parse(JSON.stringify(INITIAL_AREAS[selectionAreaKey]));
            freshArea.employee = selectionEmployee;
            newAreas[selectionAreaKey] = freshArea;
            return { ...prev, areas: newAreas };
        });

        setSearchTerm('');
        setView('inspection');
    };

    const handleViewResults = () => {
        setView('results');
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

    // **UPDATED**: Submit to Firebase
    const handleConfirmInspection = async () => {
        if (!currentAreaKey) return;
        const currentArea = inspectionData.areas[currentAreaKey];
        if (!currentArea) return;

        // --- Calculation Logic ---
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

        // Prepare record payload
        const recordToSave: Omit<InspectionRecord, 'id'> = {
            ...currentArea,
            score: totalScore,
            maxScore: maxScore,
            completed: true,
            deductions: deductions,
            employee: currentEmployee,
            areaKey: currentAreaKey,
            timestamp: new Date().toISOString(),
            monthStr: selectedMonth // Important for indexing/querying
        };

        setIsSubmitting(true);

        // OPTIMISTIC UPDATE:
        // Instead of awaiting the server response (which causes the "Slow" feeling),
        // we send the request and immediately provide feedback to the user.
        // Firebase handles the synchronization in the background.
        addDoc(collection(db, "inspections"), recordToSave)
            .then(() => {
                console.log("Sync success");
            })
            .catch((e) => {
                console.error("Background Sync Error: ", e);
                // Only alert if there is a real error later, though the user might be on another screen.
                // For a critical error, we might want to let them know.
                alert("⚠️ 警告：刚才的提交无法同步到云端！\n请检查网络连接。\n" + e.message);
            });

        // Immediate feedback for better UX
        setTimeout(() => {
            setIsSubmitting(false);
            alert("提交成功！");
            handleBackToAreas();
        }, 100); 
    };

    const handleCancelInspection = () => {
         if (window.confirm('确定要取消当前检查吗？未保存的评分将丢失。')) {
            handleBackToAreas();
        }
    };
    
    // Management Actions - UPDATED: Use Atomic Operations (arrayUnion/arrayRemove)
    // This ensures cross-device sync is robust and doesn't overwrite other data.
    const handleAddEmployee = async () => {
        const name = newEmployeeName.trim();
        if (!name) return;
        
        const docRef = doc(db, "config", "employees");
        
        try {
            // Attempt Atomic Update first
            await updateDoc(docRef, {
                [manageAreaKey]: arrayUnion(name)
            });
            setNewEmployeeName(''); 
        } catch (e: any) {
            console.error("Update failed, trying setDoc:", e);
            // Fallback: If document doesn't exist (code 'not-found'), create it.
            if (e.code === 'not-found') {
                const newState = { ...employees, [manageAreaKey]: [name] };
                 // If we have local state, merge it, otherwise start fresh for that key
                if (employees[manageAreaKey]) {
                    newState[manageAreaKey] = [...employees[manageAreaKey], name];
                }
                await setDoc(docRef, newState);
                setNewEmployeeName('');
            } else {
                alert("保存失败 (Failed to save): " + e.message);
            }
        }
    };

    const handleDeleteEmployee = async (nameToDelete: string) => {
        if (window.confirm(`确定要删除员工 ${nameToDelete} 吗？`)) {
            const docRef = doc(db, "config", "employees");
            try {
                // Atomic Remove
                await updateDoc(docRef, {
                    [manageAreaKey]: arrayRemove(nameToDelete)
                });
            } catch (e: any) {
                console.error("Error deleting employee from cloud:", e);
                alert("删除失败 (Failed to delete): " + e.message);
            }
        }
    };

    // **UPDATED**: Delete from Firebase
    const handleDeleteRecord = async (recordId: string) => {
        if(window.confirm("确定要删除这条云端检查记录吗？此操作不可恢复。")) {
            try {
                await deleteDoc(doc(db, "inspections", recordId));
            } catch (e) {
                console.error("Error deleting doc: ", e);
                alert("删除失败 (Error deleting).");
            }
        }
    };

    // **NEW**: Permission Check for Management
    const handleAccessManagement = () => {
        const password = window.prompt("请输入管理员密码以进入后台 (Enter Admin Password):");
        if (password === 'admin888') {
            setView('management');
        } else if (password !== null) {
            alert("密码错误，无法进入！(Incorrect Password)");
        }
    };

    // --- Renderers ---

    const renderInspectorInfo = () => (
        <div id="inspector-info-page">
            <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px] relative flex justify-center items-center">
                <h1 className="text-center text-2xl font-bold">超市巡店检查评分系统 (云端版)</h1>
                {/* Sync Status Indicator */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-black/20 px-2 py-1 rounded text-xs" title={syncStatus === 'connected' ? "云端已连接" : "连接中或离线"}>
                    <div className={`w-2 h-2 rounded-full ${syncStatus === 'connected' ? 'bg-green-400' : syncStatus === 'error' ? 'bg-red-500' : 'bg-yellow-400 animate-pulse'}`}></div>
                    <span>{syncStatus === 'connected' ? '已同步' : syncStatus === 'error' ? '离线' : '连接中'}</span>
                </div>

                <button 
                    onClick={handleAccessManagement}
                    className="absolute right-4 bg-white/10 hover:bg-white text-white hover:text-[#3498db] border border-white/40 px-3 py-1.5 rounded shadow-sm text-sm transition-all duration-200 flex items-center gap-1 backdrop-blur-sm"
                    title="需要管理员密码"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.157.945c.03.18.158.322.336.37.587.159 1.144.398 1.663.708.163.097.362.073.498-.06l.732-.71c.408-.396 1.05-.407 1.465-.02l.772.716c.42.389.467 1.033.106 1.47l-.54.654c-.118.143-.133.344-.04.512.277.514.475 1.057.586 1.628.035.18.175.31.358.323l.913.063c.556.038.99.492.99 1.048v1.074c0 .556-.434 1.01-.99 1.048l-.913.063c-.183.013-.323.143-.358.323a8.18 8.18 0 01-.586 1.628c-.093.168-.078.37.04.512l.54.654c.36.437.314 1.08-.106 1.47l-.772.716c-.415.387-1.057.376-1.465-.02l-.732-.71c-.136-.132-.335-.157-.498-.06a8.154 8.154 0 01-1.663.708c-.178.048-.306.19-.336.37l-.157.945c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.02-.398-1.11-.94l-.157-.945c-.03-.18-.158-.322-.336-.37a8.16 8.16 0 01-1.663-.708c-.163-.097-.362-.073-.498.06l-.732.71c-.408.396-1.05.407-1.465.02l-.772-.716c-.42-.389-.467-1.033-.106-1.47l.54-.654c.118-.143.133-.344.04-.512a8.18 8.18 0 01-.586-1.628c-.035-.18-.175-.31-.358-.323l-.913-.063c-.556-.038-.99-.492-.99-1.048v-1.074c0-.556.434-1.01.99-1.048l.913-.063c.183-.013.323-.143.358-.323.111-.57.31-1.114.586-1.628.093-.168.078-.37-.04-.512l-.54-.654c-.36-.437-.314-1.08.106-1.47l.772-.716c.415-.387 1.057-.376 1.465.02l.732.71c.136.132.335.157.498.06.52-.31 1.076-.55 1.663-.708.178-.048.306-.19.336-.37l.157-.945z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    人员管理
                </button>
            </div>

            {/* Month Selector for "Current Working Month" */}
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
                <input 
                    type="text" 
                    className="w-full p-[8px] border border-[#ddd] rounded-[4px] box-border"
                    value={inspectionData.shop}
                    onChange={(e) => setInspectionData(prev => ({...prev, shop: e.target.value}))}
                    required 
                />
            </div>
            <button 
                type="button"
                className="bg-[#27ae60] text-white border-none py-[10px] px-[15px] rounded-[4px] cursor-pointer text-[16px] m-[5px] hover:bg-[#219653] transition-colors duration-300 w-full"
                onClick={() => handleStartInspection(inspectionData.inspector, inspectionData.shop)}
            >
                开始检查 / 查看该月进度
            </button>
        </div>
    );

    const renderManagement = () => (
        <div id="management-page">
            {/* Same as before, omitted for brevity but retained in full code */}
            <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px] flex justify-between items-center">
                <h2 className="text-xl font-bold">人员管理后台</h2>
                <button 
                    onClick={() => setView('inspector-info')}
                    className="bg-transparent border border-white text-white px-3 py-1 rounded hover:bg-white hover:text-[#3498db]"
                >
                    返回首页
                </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded border">
                    <h3 className="font-bold mb-3">选择区域</h3>
                    <div className="flex flex-col gap-2">
                        {[{ key: 'vegetables', label: '蔬果区' }, { key: 'grocery', label: '食百区' }, { key: 'seafood', label: '水产区' }, { key: 'meat', label: '肉品区' }, { key: 'deli', label: '熟食区' }, { key: 'cashier', label: '收银区域' }].map(area => (
                            <button key={area.key} onClick={() => setManageAreaKey(area.key)} className={`text-left p-3 rounded ${manageAreaKey === area.key ? 'bg-[#3498db] text-white' : 'bg-white hover:bg-gray-100'}`}>
                                {area.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-full md:w-2/3 bg-white p-4 rounded border">
                    <h3 className="font-bold mb-3">管理 {manageAreaKey} 员工</h3>
                    <div className="flex gap-2 mb-4">
                        <input type="text" className="flex-1 p-2 border rounded" placeholder="输入员工姓名" value={newEmployeeName} onChange={(e) => setNewEmployeeName(e.target.value)} />
                        <button onClick={handleAddEmployee} className="bg-[#27ae60] text-white px-4 py-2 rounded hover:bg-[#219653]">添加</button>
                    </div>
                    <div className="space-y-2">
                        {employees[manageAreaKey]?.map((name, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                <span>{name}</span>
                                <button onClick={() => handleDeleteEmployee(name)} className="text-red-500 hover:text-red-700 font-bold">删除</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAreaSelection = () => {
        const areaOptions = [
            { key: 'vegetables', label: '蔬果区', sub: 'Vegetables & Fruits' },
            { key: 'grocery', label: '食百区', sub: 'Food & Grocery' },
            { key: 'seafood', label: '水产区', sub: 'SeaFood' },
            { key: 'meat', label: '肉品区', sub: 'Meat' },
            { key: 'deli', label: '熟食区', sub: 'Deli' },
            { key: 'cashier', label: '收银区域', sub: 'Cashier' }
        ];

        return (
            <div id="area-selection-page">
                <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px]">
                    <h2 className="text-center text-xl font-bold">检查区域选择</h2>
                    <p className="text-center mt-2 font-mono text-sm">月份: {selectedMonth} | 已同步记录: {isLoading ? '加载中...' : inspectionData.records.length}条</p>
                </div>
                
                <div className="max-w-md mx-auto bg-white p-6 rounded shadow-sm border border-gray-200">
                    <div className="mb-4">
                        <label className="block mb-2 font-bold text-gray-700">1. 选择区域 (Select Area)</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded bg-white"
                            value={selectionAreaKey}
                            onChange={(e) => {
                                setSelectionAreaKey(e.target.value);
                                setSelectionEmployee(''); 
                            }}
                        >
                            <option value="">-- 请选择 --</option>
                            {areaOptions.map(opt => {
                                const count = inspectionData.records.filter(r => r.areaKey === opt.key).length;
                                return (
                                    <option key={opt.key} value={opt.key}>
                                        {opt.label} {count > 0 ? `(本月已检: ${count}次)` : ''}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-bold text-gray-700">2. 选择员工 (Select Employee)</label>
                        <select 
                            className="w-full p-3 border border-gray-300 rounded bg-white"
                            value={selectionEmployee}
                            onChange={(e) => setSelectionEmployee(e.target.value)}
                            disabled={!selectionAreaKey}
                        >
                            <option value="">-- 请选择 --</option>
                            {selectionAreaKey && employees[selectionAreaKey]?.map((name, idx) => (
                                <option key={idx} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <button 
                        type="button"
                        disabled={!selectionAreaKey || !selectionEmployee}
                        className={`w-full py-3 px-4 rounded font-bold text-white transition-colors duration-300 ${(!selectionAreaKey || !selectionEmployee) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#27ae60] hover:bg-[#219653] cursor-pointer'}`}
                        onClick={handleEnterInspection}
                    >
                        开始检查 (Start Inspection)
                    </button>
                </div>

                <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">
                        {selectedMonth} 月份检查记录 ({inspectionData.records.length})
                    </h3>
                    
                    {isLoading ? (
                         <p className="text-center text-gray-500">正在从云端同步数据...</p>
                    ) : inspectionData.records.length === 0 ? (
                         <p className="text-center text-gray-400">该月份暂无检查记录</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[...inspectionData.records].reverse().map((record) => (
                                <div key={record.id} className="p-4 rounded border bg-green-50 border-green-200 relative">
                                    <div className="font-bold">{record.name}</div>
                                    <div className="text-sm mt-1 text-gray-600">
                                        员工: <strong className="text-blue-600">{record.employee}</strong>
                                    </div>
                                    <div className="text-sm mt-1">
                                        得分: {record.score} / {record.maxScore}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {new Date(record.timestamp).toLocaleString()}
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteRecord(record.id)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                                    >
                                        删除
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center mt-8 pb-8">
                    <button 
                        type="button"
                        className="bg-[#7f8c8d] text-white border-none py-[10px] px-[20px] rounded-[4px] cursor-pointer text-[16px] hover:bg-[#6c7a7d] transition-colors duration-300"
                        onClick={handleViewResults}
                        disabled={inspectionData.records.length === 0}
                    >
                        查看 {selectedMonth} 月份汇总结果 & 导出
                    </button>
                </div>
            </div>
        );
    };

    const renderInspectionPage = () => {
        // ... (Same as before, simplified for brevity in this view, keeping full logic)
        const area = inspectionData.areas[currentAreaKey];
        if (!area) return null;
        return (
            <div id="inspection-page">
                <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px]">
                    <h2 className="text-center text-xl font-bold">{area.name}</h2>
                    <p className="text-center mt-2">
                        月份: <span className="font-bold">{selectedMonth}</span> | 
                        被检员工: <span className="font-bold underline text-yellow-300">{currentEmployee}</span>
                    </p>
                </div>
                
                <div className="my-[20px] flex justify-between items-center">
                    <div>
                        <input type="text" placeholder="搜索项目..." className="w-[200px] p-[8px] border rounded" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
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
                                            <select 
                                                className="w-[80px] mr-[10px] p-[8px] border border-[#ddd] rounded-[4px]"
                                                value={standard.score}
                                                onChange={(e) => handleUpdateScore(itemIdx, stdIdx, parseInt(e.target.value))}
                                            >
                                                {Array.from({ length: standard.maxScore + 1 }, (_, i) => standard.maxScore - i).map(score => (
                                                    <option key={score} value={score}>{score}分</option>
                                                ))}
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
                    <button 
                        onClick={handleConfirmInspection} 
                        disabled={isSubmitting}
                        className={`bg-[#27ae60] text-white py-[10px] px-[20px] rounded-[4px] mr-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? '提交中...' : '提交'}
                    </button>
                    <button onClick={handleCancelInspection} className="bg-[#7f8c8d] text-white py-[10px] px-[20px] rounded-[4px]">取消</button>
                </div>
            </div>
        );
    };

    const renderResultsPage = () => {
        // --- Aggregation Logic (Same logic, now applies to selectedMonth records) ---
        type AggregatedItem = {
            name?: string; areaKey: string; employee: string; totalScore: number; maxScore: number; count: number; deductions: Deduction[];
        };

        const aggregatedData = inspectionData.records.reduce<Record<string, AggregatedItem>>((acc, record) => {
            const key = `${record.areaKey}_${record.employee}`;
            if (!acc[key]) {
                acc[key] = {
                    name: record.name, areaKey: record.areaKey, employee: record.employee || 'Unknown', totalScore: 0, maxScore: record.maxScore, count: 0, deductions: []
                };
            }
            acc[key].totalScore += record.score;
            acc[key].count += 1;
            acc[key].deductions.push(...record.deductions);
            return acc;
        }, {});

        const results = Object.values(aggregatedData).map((item: AggregatedItem) => ({
            ...item,
            avgScore: Number((item.totalScore / item.count).toFixed(1))
        }));

        const totalAvgScoreSum = results.reduce((sum, item) => sum + item.avgScore, 0);
        const totalMaxScoreSum = results.reduce((sum, item) => sum + item.maxScore, 0);
        const displayTotalScore = totalAvgScoreSum.toFixed(1);
        const overallPercentage = totalMaxScoreSum > 0 ? (totalAvgScoreSum / totalMaxScoreSum * 100).toFixed(1) : '0';

        return (
            <div id="results-page">
                <div className="bg-[#3498db] text-white p-[15px] rounded-[5px] mb-[20px]">
                    <h2 className="text-center text-xl font-bold">{selectedMonth} 月份检查结果汇总</h2>
                    <p className="text-center mt-2">数据来源: 云端数据库实时同步</p>
                </div>
                
                <div className="flex justify-center items-center mb-6">
                    <label className="mr-2 font-bold">切换月份查看历史:</label>
                    <input 
                        type="month" 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded"
                    />
                </div>

                <div className="text-[18px] font-bold my-[20px] text-center">
                    {selectedMonth} 总分 (Sum of Averages): <span>{displayTotalScore}</span> / <span>{totalMaxScoreSum}</span>
                    (<span>{overallPercentage}</span>%)
                </div>
                
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
                
                <div className="text-center mt-[20px] pb-10">
                    <button onClick={() => exportToExcel(inspectionData)} className="bg-[#27ae60] text-white px-4 py-2 rounded mr-4">导出本月报表 (Excel)</button>
                    <button onClick={handleBackToAreas} className="bg-[#7f8c8d] text-white px-4 py-2 rounded">返回</button>
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
